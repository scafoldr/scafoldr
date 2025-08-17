"""
Framework testers package for integration testing.
"""

from .base import FrameworkTester, FrameworkTesterFactory
from .java_spring import JavaSpringTester
from .node_express import NodeExpressTester
from .next_js import NextJsTester

# Register all framework testers
FrameworkTesterFactory.register_tester('java_spring', JavaSpringTester)
FrameworkTesterFactory.register_tester('node_express_js', NodeExpressTester)
FrameworkTesterFactory.register_tester('next-js-typescript', NextJsTester)

__all__ = [
    'FrameworkTester',
    'FrameworkTesterFactory',
    'JavaSpringTester',
    'NodeExpressTester',
    'NextJsTester',
]