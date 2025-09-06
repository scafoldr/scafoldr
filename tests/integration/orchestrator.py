"""
Integration test orchestrator for Scafoldr templates.
"""

import os
import json
import shutil
import subprocess
import time
import requests
from pathlib import Path
import logging
from typing import Dict, List

from .framework_testers.base import FrameworkTester, FrameworkTesterFactory
from .output_formatter import formatter, format_info, format_success, format_error, format_warning


class IntegrationTestOrchestrator:
    """Main orchestrator for running integration tests across multiple frameworks."""
    
    def __init__(self, api_base_url: str = "http://localhost:8000"):
        self.api_base_url = api_base_url
        self.base_dir = Path(__file__).parent.parent
        self.input_dir = self.base_dir / "input"
        self.output_dir = self.base_dir / "output"
        self.reports_dir = self.base_dir / "reports"
        
        # Ensure reports directory exists first
        self.reports_dir.mkdir(exist_ok=True)
        
        # Setup basic logging (for file logs)
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            filename=str(self.reports_dir / "test_execution.log"),
            filemode='a'
        )
        self.logger = logging.getLogger(__name__)
        
        # Test configuration
        self.templates = FrameworkTesterFactory.get_supported_frameworks()
        self.dbml_files = ['example.dbml', 'flowers.dbml']
        
        # Track timing
        self.test_start_time = None

    def read_dbml_file(self, dbml_file: str) -> str:
        """Read DBML content from file."""
        dbml_path = self.input_dir / dbml_file
        with open(dbml_path, 'r') as f:
            return f.read()

    def call_generate_api(self, dbml_content: str, template: str, test_name: str) -> dict:
        """Call the generate API and return the response data."""
        api_url = f"{self.api_base_url}/generate"
        
        # Extract project name from DBML if available, otherwise use test name
        project_name = test_name.replace('_', ' ').title()
        database_name = f"{project_name.lower().replace(' ', '_')}_db"
        
        payload = {
            "project_name": project_name,
            "database_name": database_name,
            "backend_option": template,
            "features": [],
            "user_input": dbml_content
        }
        
        print(format_info(f"Calling generate API for {template} with project name: {project_name}", 'api_call'))
        self.logger.info(f"Calling generate API for {template} with project name: {project_name}")
        
        response = requests.post(api_url, json=payload, timeout=120)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"API call failed: {response.status_code} - {response.text}")

    def extract_generated_code(self, response_data: dict, output_dir: str):
        """Extract the generated code from API response to output directory."""
        files = response_data.get('files', {})
        
        for file_path, file_content in files.items():
            full_path = Path(output_dir) / file_path
            
            # Create directories if they don't exist
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write file content
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(file_content)
        
        print(format_info(f"Created {len(files)} files in output directory", 'files'))
        self.logger.info(f"Created {len(files)} files in {output_dir}")

    def run_docker_compose(self, project_dir: str) -> bool:
        """Run docker-compose up -d in the project directory."""
        try:
            print(format_info("Running docker-compose up -d", 'docker'))
            self.logger.info("Running docker-compose up -d")
            
            # Change to project directory
            original_cwd = os.getcwd()
            os.chdir(project_dir)
            
            try:
                # Run docker-compose up -d
                result = subprocess.run(
                    ["docker-compose", "up", "-d", "--build"],
                    capture_output=True,
                    text=True,
                    timeout=300  # 5 minutes timeout
                )
                
                if result.returncode == 0:
                    print(format_success("Docker compose started successfully", 'docker'))
                    self.logger.info("Docker compose started successfully")
                    return True
                else:
                    print(format_error(f"Docker compose failed: {result.stderr}", 'docker'))
                    self.logger.error(f"Docker compose failed: {result.stderr}")
                    return False
                    
            finally:
                os.chdir(original_cwd)
                
        except subprocess.TimeoutExpired:
            print(format_error("Docker compose timed out", 'docker'))
            self.logger.error("Docker compose timed out")
            return False
        except Exception as e:
            print(format_error(f"Error running docker compose: {str(e)}", 'docker'))
            self.logger.error(f"Error running docker compose: {str(e)}")
            return False

    def wait_for_application(self, framework_tester: FrameworkTester) -> bool:
        """Wait for the application to be ready using framework-specific logic."""
        health_url = framework_tester.get_health_endpoint()
        max_wait = framework_tester.get_docker_wait_time()
        framework_name = framework_tester.get_framework_name()
        
        print(format_info(f"Waiting for {framework_name} application at {health_url}", 'health_check'))
        self.logger.info(f"Waiting for {framework_name} application at {health_url}")
        
        for i in range(max_wait):
            try:
                response = requests.get(health_url, timeout=5)
                
                if framework_tester.check_application_ready(response):
                    print(format_success(f"{framework_name} application is ready! (took {i+1} seconds)", 'health_check'))
                    self.logger.info(f"{framework_name} application is ready! (took {i+1} seconds)")
                    return True
                        
            except requests.exceptions.RequestException as e:
                if i % 10 == 0:  # Log every 10 seconds
                    self.logger.debug(f"Waiting for {framework_name}... ({str(e)})")
                pass
            
            time.sleep(1)
        
        print(format_error(f"{framework_name} application did not become ready within {max_wait} seconds", 'health_check'))
        self.logger.error(f"{framework_name} application did not become ready within {max_wait} seconds")
        return False

    def stop_docker_compose(self, project_dir: str):
        """Stop and clean up docker compose."""
        try:
            original_cwd = os.getcwd()
            os.chdir(project_dir)
            
            try:
                subprocess.run(
                    ["docker-compose", "down", "-v"],
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                print(format_info("Docker compose stopped and cleaned up", 'cleanup'))
                self.logger.info("Docker compose stopped and cleaned up")
            finally:
                os.chdir(original_cwd)
                
        except Exception as e:
            print(format_error(f"Error stopping docker compose: {str(e)}", 'cleanup'))
            self.logger.error(f"Error stopping docker compose: {str(e)}")

    def test_single_combination(self, dbml_file: str, template: str) -> dict:
        """Test a single DBML file with a single template."""
        test_name = f"{template}_{dbml_file.replace('.dbml', '')}"
        
        # Create framework tester
        try:
            framework_tester = FrameworkTesterFactory.create_tester(template)
        except ValueError as e:
            return {
                'test_name': test_name,
                'dbml_file': dbml_file,
                'template': template,
                'success': False,
                'steps': {},
                'error': str(e),
                'project_dir': None
            }
        
        # Print framework test banner
        formatter.print_framework_start(framework_tester.get_framework_name(), test_name)
        self.logger.info(f"Starting test: {test_name}")
        
        # Track test timing
        self.test_start_time = time.time()
        
        result = {
            'test_name': test_name,
            'dbml_file': dbml_file,
            'template': template,
            'framework_name': framework_tester.get_framework_name(),
            'success': False,
            'steps': {},
            'error': None,
            'project_dir': None
        }
        
        project_dir = None
        
        try:
            # Step 1: Read DBML
            dbml_content = self.read_dbml_file(dbml_file)
            result['steps']['read_dbml'] = True
            
            # Step 2: Call generate API
            response_data = self.call_generate_api(dbml_content, template, test_name)
            result['steps']['api_call'] = True
            
            # Step 3: Extract to output directory
            project_dir = self.output_dir / test_name
            # Remove existing directory if it exists
            if project_dir.exists():
                shutil.rmtree(project_dir)
            project_dir.mkdir(parents=True, exist_ok=True)
            
            result['project_dir'] = str(project_dir)
            self.extract_generated_code(response_data, str(project_dir))
            result['steps']['extract_code'] = True
            
            # Step 4: Run docker-compose up -d
            if self.run_docker_compose(str(project_dir)):
                result['steps']['docker_up'] = True
                
                # Step 5: Wait for application to be ready (using framework-specific logic)
                if self.wait_for_application(framework_tester):
                    result['steps']['app_ready'] = True
                    result['success'] = True
                else:
                    result['steps']['app_ready'] = False
                    result['error'] = "Application did not become ready"

            else:
                result['steps']['docker_up'] = False
                result['error'] = "Docker compose failed to start"
            
            # Always stop docker compose
            if project_dir:
                self.stop_docker_compose(str(project_dir))
            
        except Exception as e:
            result['error'] = str(e)
            self.logger.error(f"Test {test_name} failed: {str(e)}")
            
            # Cleanup on exception
            if project_dir:
                self.stop_docker_compose(str(project_dir))
        
        # Calculate test duration
        test_duration = time.time() - self.test_start_time if self.test_start_time else None
        
        # Print test result with styling
        formatter.print_test_result(test_name, result['success'], test_duration)
        
        status = "PASS" if result['success'] else "FAIL"
        self.logger.info(f"Test {test_name}: {status}")
        
        return result

    def run_all_tests(self) -> List[dict]:
        """Run all test combinations."""
        # Print header
        formatter.print_header("SCAFOLDR INTEGRATION TESTS")
        self.logger.info("Starting simple integration tests")
        
        # Ensure output and reports directories exist
        self.output_dir.mkdir(exist_ok=True)
        self.reports_dir.mkdir(exist_ok=True)
        
        results = []
        
        for dbml_file in self.dbml_files:
            for template in self.templates:
                result = self.test_single_combination(dbml_file, template)
                results.append(result)
        
        # Generate summary report and display
        self.generate_report(results)
        self.print_final_summary(results)
        
        return results
    
    def print_final_summary(self, results: List[dict]):
        """Print final test summary with styled output."""
        total_tests = len(results)
        passed_tests = sum(1 for r in results if r['success'])
        failed_tests = total_tests - passed_tests
        
        formatter.print_summary(total_tests, passed_tests, failed_tests)

    def generate_report(self, results: List[dict]):
        """Generate test report."""
        total_tests = len(results)
        passed_tests = sum(1 for r in results if r['success'])
        failed_tests = total_tests - passed_tests
        
        # JSON report
        report_data = {
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'summary': {
                'total': total_tests,
                'passed': passed_tests,
                'failed': failed_tests,
                'success_rate': (passed_tests / total_tests * 100) if total_tests > 0 else 0
            },
            'results': results
        }
        
        json_report = self.reports_dir / "simple_integration_report.json"
        with open(json_report, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        # Text report
        text_report = self.reports_dir / "simple_integration_report.txt"
        with open(text_report, 'w') as f:
            f.write("SCAFOLDR SIMPLE INTEGRATION TEST REPORT\n")
            f.write("=" * 50 + "\n\n")
            f.write(f"Timestamp: {report_data['timestamp']}\n")
            f.write(f"Total Tests: {total_tests}\n")
            f.write(f"Passed: {passed_tests}\n")
            f.write(f"Failed: {failed_tests}\n")
            f.write(f"Success Rate: {report_data['summary']['success_rate']:.1f}%\n\n")
            
            for result in results:
                status = "PASS" if result['success'] else "FAIL"
                f.write(f"Test: {result['test_name']} - {status}\n")
                f.write(f"  DBML: {result['dbml_file']}\n")
                f.write(f"  Template: {result['template']}\n")
                f.write(f"  Framework: {result.get('framework_name', 'Unknown')}\n")
                
                if result['error']:
                    f.write(f"  Error: {result['error']}\n")
                
                f.write("  Steps:\n")
                for step, success in result['steps'].items():
                    step_status = "✓" if success else "✗"
                    f.write(f"    {step_status} {step}\n")
                
                f.write("\n")
        
        print(format_info("Reports generated:", 'reports'))
        print(format_info(f"  JSON: {json_report}", 'files'))
        print(format_info(f"  Text: {text_report}", 'files'))
        self.logger.info(f"Reports generated:")
        self.logger.info(f"  JSON: {json_report}")
        self.logger.info(f"  Text: {text_report}")