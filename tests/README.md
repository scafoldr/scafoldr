# Running Tests

This document provides instructions on how to run the tests for the application, including prerequisites, what the tests cover, and how they work.

## Prerequisites

Before running the tests, ensure that you have the following set up:

1. **Docker**: Make sure Docker is installed and running on your machine. This is necessary for creating the testing environment.
2. **Application Running**: The application must be running on `localhost:8000`. You can start the application using the appropriate command for your setup.

## How to Run Tests

To execute the tests, follow these steps:

1. Open a terminal window.
2. Navigate to the `tests` directory:
   ```bash
   cd tests
   ```
3. Run the tests using the following command:
   ```bash
   ./run_simple_tests.sh
   ```

## What the Tests Cover

The tests are designed to validate various aspects of the application, including:

- **Integration Tests**: These tests check the interaction between different components of the application to ensure they work together as expected.
- **Unit Tests**: These tests focus on individual functions or methods to verify that they perform correctly in isolation.

## How the Tests Work

The tests are written in Python and utilize a testing framework to execute the test cases. Each test case is designed to simulate real-world scenarios and validate the application's behavior under different conditions.

The results of the tests will be displayed in the terminal, indicating whether each test passed or failed. If any tests fail, the output will provide details on what went wrong, allowing for quick identification and resolution of issues.

By following these instructions, you can ensure that the application is functioning correctly and that any changes made do not introduce new issues.