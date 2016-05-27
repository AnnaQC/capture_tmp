# -*- coding: utf-8 -*-
"""
Created on Apr 25, 2016

@author: user

"""
import unittest

from core import comparator
from core import pattern_handler
from pages import linkidin_profile
from tests import base_test


class LinkedinPatternTest(base_test.BaseTest):
    def test_profile_ptrn_by_logged_in_user(self):
        # initialization
        handler = pattern_handler
        driver = self.driver
        linkidin = linkidin_profile.LinkidinLoginPage(driver)
        test_page = linkidin_profile.LinkidinProfilePage(driver, is_logged=True)
        # login by test user
        linkidin.login(linkidin.sign_in_link, linkidin.login_form, linkidin.default_user)
        # Open test page and get parsed data by Webdriver as expected results
        expected = test_page.open().parse_text()
        # read actual data from captured results
        actual = handler.get_actual_data_from_js_console(driver)
        # expected = test_page.getExpectedData()
        self.assertTrue(comparator.is_pattern_data_according_to_page(actual, expected))


if __name__ == '__main__':
    unittest.main()
