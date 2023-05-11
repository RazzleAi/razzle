from setuptools import setup, find_packages

# Read the requirements.txt file
with open('requirements.txt') as f:
    requirements = f.read().splitlines()

setup(
    name='razzlesdk',
    packages=['razzlesdk'],
    version='0.0.1',
    description='Razzle SDK',
    author='Razzle',
    license='MIT',
    install_requires=requirements,
)
