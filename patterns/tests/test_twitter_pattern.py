# -*- coding: utf-8 -*-

import pytest
import allure
import time

from tests_fixture import chromedriver
from core import comparator
from core import pattern_handler
from core import config_reader
from pages import authorization

config = config_reader.ReadConfigs()


@allure.feature('Twitter patterns')
@allure.story('Twitter user profile pattern. User is logged in to twitter')
@pytest.mark.parametrize("test_page", config.get_tested_pages_for('twitter'))
def test_profile_ptrn_for_logged_in_user(chromedriver, test_page):
    """
     As logged in to twitter user I open some user profiles in browser.
     Get actual data from result is captured by extension.
     Read expected results that should be present on the test page from patterns/data/twitter/profile_page*.ini
     And check if expected data from the page is present within the captured results.

    """
    handler = pattern_handler
    test_page = '..' + config.twitter_test_data + test_page
    twitter = authorization.TwitterAuthPage(chromedriver, test_page, 'project')
    twitter.login(twitter.sign_in_link, twitter.login_form, twitter.default_user)
    twitter.open(config.read_options_for('twitter', test_page))
    time.sleep(3)
    with allure.step('Read expected result from profile page'):
        expected = config.read_expected_results_from_file(test_page, 'profile after log in')
    with allure.step('Read attributes from result is captured by extension'):
        actual = handler.get_actual_data_from_js_console(chromedriver)
    print actual
    with allure.step('Check if captured results contain data expected data'):
        assert comparator.is_pattern_data_according_to_page(actual, expected),\
                 "Incorrect data was found in captured results. See mismatches in attached detailes."


@allure.feature('Twitter patterns')
@allure.story('Twitter user profile pattern. User is not logged in to Twitter')
@pytest.mark.parametrize("test_page", config.get_tested_pages_for('twitter'))
def test_profile_ptrn_without_log_in(chromedriver, test_page):
    """
     As user that is not logged in to twitter I open some user profiles in browser.
     Get actual data from result is captured by extension.
     Read expected results that should be present on the test page from patterns/data/twitter/profile_page*.ini
     And check if expected data from the page is present within the captured results.

    """
    handler = pattern_handler
    test_page = '..' + config.twitter_test_data + test_page
    twitter= authorization.TwitterAuthPage(chromedriver)
    twitter.logout()
    twitter.open(config.read_options_for('twitter', test_page))
    time.sleep(3)
    with allure.step('Read expected result from profile page'):
        expected = config.read_expected_results_from_file(test_page, 'profile without log in')
    with allure.step('Read attributes from result is captured by extension'):
        actual = handler.get_actual_data_from_js_console(chromedriver)
    print actual
    with allure.step('Check if captured results contain data expected data'):
        assert comparator.is_pattern_data_according_to_page(actual, expected),\
                 "Incorrect data was found in captured results. See mismatches in attached detailes."
    print test_page
