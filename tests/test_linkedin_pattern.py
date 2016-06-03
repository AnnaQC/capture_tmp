# -*- coding: utf-8 -*-

import unittest

import allure

from core import comparator
from core import pattern_handler
from pages import linkidin_profile
from tests import base_test


@allure.feature('Linkedin patterns')
class LinkedinPatternTest(base_test.BaseTest):

    @allure.story('Linkedin user profile pattern. User is logged in to linkedin')

    def test_profile_ptrn_by_logged_in_user(self):
        """
        As logged in to linkedin user I open some user profile in browser.
        Read data from the opened page.
        Get data from result is captured by extension.
        And check if data from the page is present within the captured results.
        Tested attributes:
        {
         "bio" - summary,
         "full" - users fullname,
         "company" - current company name,
         "first" - firstname,
         "last" - lastname,
         "city" - locality,
         "jobtitle" - job,
         "linkedin" - link from the contact info,
         "twitter" - link from the contact info,
         "email" - address from the contact info
         }
        """
        # initialization
        handler = pattern_handler
        driver = self.driver
        linkidin = linkidin_profile.LinkidinLoginPage(driver)
        test_page = linkidin_profile.LinkidinProfilePage(driver, is_logged=True)
        # login by test user
        linkidin.login(linkidin.sign_in_link, linkidin.login_form, linkidin.default_user)
        # Open test page and get parsed data by Webdriver as expected results
        test_page.open()
        with allure.step('Read attributes from profile page'):
            expected = test_page.parse_text()
        # read actual data from captured results
        with allure.step('Read attributes from result is captured by extension'):
            actual = handler.get_actual_data_from_js_console(driver)
        with allure.step('Check if captured results contain data from page'):
            self.assertTrue(comparator.is_pattern_data_according_to_page(actual, expected),
                            "Incorrect data was found in captured results. See mismatches in attached detailes.")


if __name__ == '__main__':
    unittest.main()
