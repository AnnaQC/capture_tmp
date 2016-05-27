# -*- coding: utf-8 -*-
"""
Created on Apr 25, 2016

@author: user

"""
import os
import unittest

from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities


class BaseTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.driver = cls.setup_webdriver()
        print "setUp"

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    @staticmethod
    def setup_webdriver():
        """
        sets up webdriver according to OS properties
        and adds path to test profile directory
        """
        path_to_driver = os.path.abspath(os.getcwd() + "/../resources/drivers/chromedriver")
        path_to_chrome_profile = os.path.abspath(os.getcwd() + "/../resources/chrome_profile")
        path_to_extension_crx = os.path.abspath(os.getcwd() + "/../resources/Capture-ALPHA_v2.1.0.127.crx")
        path_to_extension_dir = os.path.abspath(os.getcwd() + "/../resources/Capture-ALPHAv2.1.0.127")
        # enable browser logging
        capabilities = DesiredCapabilities.CHROME
        capabilities['loggingPrefs'] = {'browser': 'INFO'}
        options = webdriver.ChromeOptions()
        # options.add_extension(path_to_crx)
        # options.add_argument("user-data-dir=" + path_to_chrome_profile)
        options.add_argument("load-extension=" + path_to_extension_dir)
        BaseTest.driver = webdriver.Chrome(path_to_driver, chrome_options=options, desired_capabilities=capabilities)

        return BaseTest.driver


if __name__ == '__main__':
    unittest.main()
