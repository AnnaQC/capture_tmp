#!/bin/bash
# Install script
echo "Installing Pithon"
sudo apt-get install libxml2-dev libxslt-dev python-dev
echo "Python installed"
echo ""
echo "Installing Selenium"
sudo pip install selenium
echo "Selenium installed"
echo ""
echo "Installing Pytest"
sudo pip install pytest
echo "Pytest installed"
echo ""
echo "Installing Pytest-adaptor"
sudo pip install pytest-allure-adaptor
echo "Pytest-adaptor installed"
echo ""
echo "Installing Yandex Repository"
sudo apt-add-repository ppa:yandex-qatools/allure-framework
echo "Yandex Repository installed"
echo ""
echo "Updating package list"
sudo apt-get update 
echo "Package updated"
echo ""
echo "Installing Allure-commandline"
sudo apt-get install allure-commandline
echo "Allure-commandline installed"