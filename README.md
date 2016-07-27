
*Set Up Environment
*Run test
*Generate And Open report
*Set Up Environment and Run Tests via scripts

==========================================
Set Up Environment for OS LINUX:
------------------------------------------
1. Install selenium, pytest, pytest-allure-adaptor using pip to run tests
2. Install allure-commandline to generate report      

   $ sudo apt-get install libxml2-dev libxslt-dev python-dev
   $ sudo pip install selenium
   $ sudo pip install pytest
   $ sudo pip install pytest-allure-adaptor

   $ sudo apt-add-repository ppa:yandex-qatools/allure-framework
   $ sudo apt-get update 
   $ sudo apt-get install allure-commandline

------------------------------------------
Run test:
=========================================
   $ cd ./patterns/tests
   $ py.test test_linkedin_pattern.py --alluredir ../reports/allure_info/
-----------------------
To run all tests in scope:

   $ py.test --alluredir ../reports/allure_info/

If you want to change url of tested page or version of tested extention change their values in /patterns/config.ini
=========================================
Generate report:

   $ allure generate ../reports/allure_info/ -o ../reports/allure_report/
   $ allure report open -o ../reports/allure_report/


=============================================================
Set Up environment and Run Tests via scripts on Linux:
-----------------------------------------------------------
Set Up environment. 
Run executable file installEnvironmentl.sh 

   $ chmod +x installEnvironmentl.sh
   $ ./installEnvironmentl.sh

----------------------------------------------------------
Run Tests. Run executable file runTest.sh

   $ chmod +x runTest.sh
   $ ./runTest.sh


