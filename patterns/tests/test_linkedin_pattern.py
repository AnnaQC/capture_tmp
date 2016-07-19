# -*- coding: utf-8 -*-

import pytest
import allure
import time

from tests_fixture import chromedriver

from core import comparator
from core import pattern_handler
from core import config_reader
from pages import linkidin_profile, authorization

config = config_reader.ReadConfigs()
print config
@allure.feature('Linkedin patterns')
@allure.story('Linkedin user profile pattern. User is logged in to linkedin')
@pytest.mark.parametrize("test_page", config.get_tested_pages_for('linkedin'))
def test_profile_ptrn_for_logged_in_user(chromedriver, test_page):
    """
     As logged in to linkedin user I open some user profiles in browser.
     Get actual data from result is captured by extension.
     Read expected results that should be present on the test page from patterns/data/linkedin/profile_page*.ini
     And check if expected data from the page is present within the captured results.
    """
    handler = pattern_handler
    test_page = '..' + config.linkedin_test_data + test_page
    linkidin = authorization.LinkidinAuthPage(chromedriver, test_page, 'project')
    linkidin.login(linkidin.sign_in_link, linkidin.login_form, linkidin.default_user)
    print "goto " + config.read_options_for('linkedin', test_page)
    linkidin.open(config.read_options_for('linkedin', test_page))
    time.sleep(3)
    print chromedriver.current_url
    with allure.step('Read expected result from profile page'):
        expected = config.read_expected_results_from_file(test_page, 'profile after log in')
    with allure.step('Read attributes from result is captured by extension'):
        actual = handler.get_actual_data_from_js_console(chromedriver)
    print actual
    with allure.step('Check if captured results contain data expected data'):
        assert comparator.is_pattern_data_according_to_page(actual, expected),\
                 "Incorrect data was found in captured results. See mismatches in attached detailes."

@pytest.mark.skip(reason=None)
@allure.feature('Linkedin patterns')
@allure.story('Linkedin user profile pattern. User is not logged in to linkedin')
@pytest.mark.parametrize("test_page", config.get_tested_pages_for('linkedin'))
def test_profile_ptrn_without_log_in(chromedriver, test_page):
    """
    SHOULD BE USED ONLY FOR UKRAINE AND SOME OTHER COUNTRIES. THIS TEST CASE IS NOT reproducible for American variant of Linkedin.
     As user that is not logged in to linkedin I open some user profiles in browser.
     Get actual data from result is captured by extension.
     Read expected results that should be present on the test page from patterns/data/linkedin/profile_page*.ini
     And check if expected data from the page is present within the captured results.
    """
    handler = pattern_handler
    test_page = '..' + config.linkedin_test_data + test_page
    linkidin = authorization.LinkidinAuthPage(chromedriver)
    linkidin.logout()
    linkidin.open(config.read_options_for('linkedin', test_page))
    time.sleep(3)
    with allure.step('Read expected result from profile page'):
        expected = config.read_expected_results_from_file(test_page, 'profile without log in')
    with allure.step('Read attributes from result is captured by extension'):
        actual = handler.get_actual_data_from_js_console(chromedriver)
    with allure.step('Check if captured results contain data expected data'):
        assert comparator.is_pattern_data_according_to_page(actual, expected),\
                 "Incorrect data was found in captured results. See mismatches in attached detailes."

@pytest.mark.skip(reason=None)
@pytest.mark.parametrize("profile", config.get_tested_pages_for('linkedin'))
@allure.feature('Linkedin patterns')
@allure.story('Linkedin user profile pattern. User is logged in to linkedin')
def test_profile_ptrn_by_logged_in_user(chromedriver,profile):
    """
     As logged in to linkedin user I open some user profile in browser.
     Read data from the opened page via WEBDRIVER .
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
     """  # initialization
    profile = '..' + config.linkedin_test_data + profile
    handler = pattern_handler
    linkidin = authorization.LinkidinAuthPage(chromedriver)
    test_page = linkidin_profile.LinkidinProfilePage(chromedriver, is_logged=True)
    # login by test user
    linkidin.login(linkidin.sign_in_link, linkidin.login_form, linkidin.default_user)
    # Open test page and get parsed data by Webdriver as expected results
    test_page.open(config.read_options_for('linkedin', test_page, 'project'))
    with allure.step('Read attributes from profile page'):
        expected = config.read_expected_results_from_file(profile, 'profile_after_log_in')
        expected_wd = test_page.parse_text()
    # read actual data from captured results
    with allure.step('Read attributes from result is captured by extension'):
        actual = handler.get_actual_data_from_js_console(chromedriver)
    with allure.step('Check if captured results contain data from page'):
        assert comparator.is_pattern_data_according_to_page(actual, expected),\
            "Incorrect data was found in captured results. See mismatches in attached detailes."
