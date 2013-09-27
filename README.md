# WakandaDB Academy solution #

A Wakanda Server learning platform with server-side JavaScript execution sandbox

**This WAK6 branch is the ongoing version to replace the WAK5 version
in production on http://play.wakanda.org it has been updated to run with Wakanda 6**

## Getting Started ##

###1. Admin user###
The default *'admin'* user has for password *'admin'*

**You must personalize it before putting a version in production**

###2. Launch the project###

The main Web page will provide you a short presentation followed by a Server-Side JavaScript console to play with.

Some code examples are proposed to discover the API of the WakandaDB NoSQL engine.

###3. Fake data###
The project include a fakeData generator module.
A tool script can be used to generate the amount of fake employees you want. **It is called by default on startup of the project by the "initApp" shared worker and creates approximatively 20,000 employees if no data exist in the database**.

To create 1 million, more or less fake data you can:

1. Goto the 'Tools' folder of the *'WakandaDB-Academy'* project
2. Open *'createFakeData.js'*
3. Set the *'COUNT_EMPLOYEES_TO_CREATE'* value
4. Run the script



## License (MIT License) ##

Copyright (c) 2013 4D

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
