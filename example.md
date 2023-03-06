Writing a Python wrapper for a C++ class involves several steps. Here are the general steps to follow:

1. Define the C++ class or API that you want to use in Python.
2. Use a tool like SWIG (Simplified Wrapper and Interface Generator) or pybind11 to generate the wrapper code. SWIG takes the C++ header file as input and generates the wrapper code in a target language, including Python. pybind11 is a lightweight header-only library that exposes C++ types in Python with minimal boilerplate code.
3. Build the C++ code and the generated wrapper code as a shared library.
4. Use the Python module to import and access the C++ functionality from Python. 

Here is a sample code snippet demonstrating these steps:

```
// Example C++ class
class ExampleClass {
public:
    void printMessage() {
        std::cout 

class ExampleClass {
public:
    void printMessage() {
        std::cout (m, "ExampleClass")
        .def(py::init())
        .def("printMessage", &ExampleClass::printMessage);
}
```

This code defines a Python module `example`, which exposes the `ExampleClass` C++ class. You can then use this module in Python as follows:

```
import example

e = example.ExampleClass()
e.printMessage()
```