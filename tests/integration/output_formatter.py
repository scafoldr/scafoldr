"""
Styled output formatter for integration tests.
Provides colored output with emojis and better formatting.
"""

import sys
from typing import Optional
from enum import Enum


class Color:
    """ANSI color codes for terminal output."""
    # Text colors
    BLACK = '\033[30m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'
    
    # Bright colors
    BRIGHT_BLACK = '\033[90m'
    BRIGHT_RED = '\033[91m'
    BRIGHT_GREEN = '\033[92m'
    BRIGHT_YELLOW = '\033[93m'
    BRIGHT_BLUE = '\033[94m'
    BRIGHT_MAGENTA = '\033[95m'
    BRIGHT_CYAN = '\033[96m'
    BRIGHT_WHITE = '\033[97m'
    
    # Background colors
    BG_BLACK = '\033[40m'
    BG_RED = '\033[41m'
    BG_GREEN = '\033[42m'
    BG_YELLOW = '\033[43m'
    BG_BLUE = '\033[44m'
    BG_MAGENTA = '\033[45m'
    BG_CYAN = '\033[46m'
    BG_WHITE = '\033[47m'
    
    # Styles
    BOLD = '\033[1m'
    DIM = '\033[2m'
    ITALIC = '\033[3m'
    UNDERLINE = '\033[4m'
    BLINK = '\033[5m'
    REVERSE = '\033[7m'
    STRIKETHROUGH = '\033[9m'
    
    # Reset
    RESET = '\033[0m'
    
    @classmethod
    def is_terminal_color_supported(cls) -> bool:
        """Check if terminal supports colors."""
        return hasattr(sys.stdout, 'isatty') and sys.stdout.isatty()


class LogLevel(Enum):
    """Log levels with associated styling."""
    INFO = "INFO"
    SUCCESS = "SUCCESS"
    WARNING = "WARNING"
    ERROR = "ERROR"
    DEBUG = "DEBUG"


class StyledFormatter:
    """Formatter for styled console output."""
    
    def __init__(self, use_colors: bool = None):
        """Initialize the formatter.
        
        Args:
            use_colors: Whether to use colors. If None, auto-detect terminal support.
        """
        if use_colors is None:
            use_colors = Color.is_terminal_color_supported()
        self.use_colors = use_colors
        
        # Emoji mappings
        self.emojis = {
            'test_start': '🚀',
            'api_call': '📡',
            'code_gen': '⚙️',
            'docker': '🐳',
            'health_check': '❤️',
            'pass': '✅',
            'fail': '❌',
            'warning': '⚠️',
            'info': 'ℹ️',
            'cleanup': '🧹',
            'reports': '📊',
            'framework': '🔧',
            'time': '⏱️',
            'files': '📁'
        }
        
        # Color schemes for different log levels
        self.level_styles = {
            LogLevel.INFO: Color.CYAN,
            LogLevel.SUCCESS: Color.BRIGHT_GREEN,
            LogLevel.WARNING: Color.YELLOW,
            LogLevel.ERROR: Color.BRIGHT_RED,
            LogLevel.DEBUG: Color.DIM + Color.WHITE
        }
    
    def _colorize(self, text: str, color: str) -> str:
        """Apply color to text if colors are enabled."""
        if not self.use_colors:
            return text
        return f"{color}{text}{Color.RESET}"
    
    def _get_timestamp_style(self) -> str:
        """Get styled timestamp."""
        if not self.use_colors:
            return ""
        return Color.DIM + Color.WHITE
    
    def format_message(self, level: LogLevel, message: str, emoji_key: Optional[str] = None) -> str:
        """Format a log message with colors and emojis."""
        # Get emoji
        emoji = self.emojis.get(emoji_key, '') if emoji_key else ''
        if emoji:
            emoji += ' '
        
        # Get color for level
        color = self.level_styles.get(level, Color.WHITE)
        
        # Format the message
        level_text = self._colorize(f"[{level.value}]", color)
        message_text = self._colorize(message, color)
        
        return f"{emoji}{level_text} {message_text}"
    
    def print_separator(self, char: str = "─", length: int = 60, color: str = Color.DIM):
        """Print a separator line."""
        separator = char * length
        print(self._colorize(separator, color))
    
    def print_header(self, title: str):
        """Print a formatted header."""
        self.print_separator("═", 60, Color.BRIGHT_BLUE)
        header_text = f" {title} "
        centered = header_text.center(60)
        print(self._colorize(centered, Color.BRIGHT_BLUE + Color.BOLD))
        self.print_separator("═", 60, Color.BRIGHT_BLUE)
    
    def print_framework_start(self, framework_name: str, test_name: str):
        """Print framework test start banner."""
        print()  # Add spacing
        self.print_separator("─", 50, Color.BRIGHT_MAGENTA)
        banner = f"🔧 Testing {framework_name}"
        print(self._colorize(banner.center(50), Color.BRIGHT_MAGENTA + Color.BOLD))
        sub_banner = f"Test: {test_name}"
        print(self._colorize(sub_banner.center(50), Color.MAGENTA))
        self.print_separator("─", 50, Color.BRIGHT_MAGENTA)
    
    def print_test_result(self, test_name: str, success: bool, duration: Optional[float] = None):
        """Print test result with appropriate styling."""
        if success:
            emoji = self.emojis['pass']
            result_text = "PASS"
            color = Color.BRIGHT_GREEN + Color.BOLD
        else:
            emoji = self.emojis['fail']
            result_text = "FAIL"
            color = Color.BRIGHT_RED + Color.BOLD
        
        duration_text = ""
        if duration:
            duration_text = f" {self.emojis['time']} {duration:.1f}s"
        
        result_line = f"{emoji} {test_name}: {result_text}{duration_text}"
        print(self._colorize(result_line, color))
    
    def print_step(self, step_name: str, emoji_key: str, details: str = ""):
        """Print a test step with appropriate emoji and styling."""
        emoji = self.emojis.get(emoji_key, '')
        step_text = f"  {emoji} {step_name}"
        if details:
            step_text += f": {details}"
        
        print(self._colorize(step_text, Color.CYAN))
    
    def print_summary(self, total: int, passed: int, failed: int):
        """Print test summary."""
        print()
        self.print_header("TEST SUMMARY")
        
        # Total tests
        total_text = f"Total Tests: {total}"
        print(self._colorize(total_text, Color.WHITE + Color.BOLD))
        
        # Passed tests
        if passed > 0:
            passed_text = f"{self.emojis['pass']} Passed: {passed}"
            print(self._colorize(passed_text, Color.BRIGHT_GREEN + Color.BOLD))
        
        # Failed tests
        if failed > 0:
            failed_text = f"{self.emojis['fail']} Failed: {failed}"
            print(self._colorize(failed_text, Color.BRIGHT_RED + Color.BOLD))
        
        # Success rate
        success_rate = (passed / total * 100) if total > 0 else 0
        rate_color = Color.BRIGHT_GREEN if success_rate == 100 else Color.YELLOW if success_rate >= 80 else Color.BRIGHT_RED
        rate_text = f"Success Rate: {success_rate:.1f}%"
        print(self._colorize(rate_text, rate_color + Color.BOLD))
        
        print()


# Global formatter instance
formatter = StyledFormatter()


def set_color_mode(enabled: bool):
    """Enable or disable colored output."""
    global formatter
    formatter.use_colors = enabled


def format_info(message: str, emoji_key: str = 'info') -> str:
    """Format an info message."""
    return formatter.format_message(LogLevel.INFO, message, emoji_key)


def format_success(message: str, emoji_key: str = 'pass') -> str:
    """Format a success message."""
    return formatter.format_message(LogLevel.SUCCESS, message, emoji_key)


def format_warning(message: str, emoji_key: str = 'warning') -> str:
    """Format a warning message."""
    return formatter.format_message(LogLevel.WARNING, message, emoji_key)


def format_error(message: str, emoji_key: str = 'fail') -> str:
    """Format an error message."""
    return formatter.format_message(LogLevel.ERROR, message, emoji_key)