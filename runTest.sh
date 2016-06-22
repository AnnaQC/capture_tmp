#!/bin/bash
# Run test
echo "If you want to change url of tested page or version of tested extention change their values in /patterns/config.ini"
read -p "Do You want to run the test ( Y / N)? " REQUEST1
if [[ $REQUEST1 =~ ^(yes|y) ]]; then
  echo "Starting test"
  cd ./patterns/tests
  py.test --alluredir ../reports/allure_info/
else
  exit 0
fi
echo ""
read -p "Do You want to generate the report ( Y / N)? " REQUEST2
if [[ $REQUEST2 =~ ^(yes|y) ]]; then
  echo "Generating reports"
  allure generate ../reports/allure_info/ -o ../reports/allure_report/
  allure report open -o ../reports/allure_report/
else
  exit 0
fi
