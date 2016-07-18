# -*- coding: utf-8 -*-
""" Describes logic to sign in and sign out for different resources.
For each type of resources we have describe class with address and locators of form to sign in or locator to sign_out link"""
import allure
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException

from pages.base_page import BasePage
from core.config_reader import ReadConfigs


class LinkidinAuthPage(BasePage):
    config = ReadConfigs()

    sign_in_link = "https://www.linkedin.com/uas/login"
    # to sign in
    login_form = {'user_field': (By.ID, "session_key-login"),
                  'pwd_field': (By.ID, "session_password-login"),
                  'submit_btn': (By.ID, "btn-primary")}
    scrollbar = (By.ID,
                 "responsive-nav-scrollable")  # bar that is displayed only for logged in user, we use it presence to now if login was successfull
    #to sign out
    acc_settings = (By.XPATH, ".//*[contains(@class, 'account-toggle')]")
    sign_out_ref = (By.XPATH, ".//*[@class='account-submenu-split-link']")

    def __init__(self, driver, test_page_config=None,config_level='project'):
        self.driver = driver
        self.config.read_options_for('linkedin', test_page_config, config_mode=config_level)
        self.default_user = {'login': self.config.login, 'pwd': self.config.pwd}

    @allure.step('Login by user account: {3}')#
    def login(self, sign_in_link, login_form, user_data):
        self.attach_screen_to_report(self.driver.current_url)
        BasePage.login(self, sign_in_link, login_form, user_data, self.scrollbar)
        self.attach_screen_to_report(self.driver.current_url)
        return self

    def logout(self):
        self.move_to_element_and_click(self.acc_settings, self.sign_out_ref)
        return self


class TwitterAuthPage(BasePage):
    config = ReadConfigs()
    #to sign in
    sign_in_link = "https://twitter.com/login"
    login_form = {'user_field': (By.XPATH, ".//div[@class = 'clearfix field'][1]/input"),
                  'pwd_field': (By.XPATH, ".//div[@class = 'clearfix field'][2]/input"),
                  'submit_btn': (By.XPATH, ".//button[contains(@class, 'primary-btn')]")}
    acc_settings = (By.ID,
                 "user-dropdown-toggle")  # bar that is displayed only for logged in user, we use it presence to now if login was successfull
    #to sign out
    sign_out_ref = (By.ID, "signout-button")

    def __init__(self, driver, test_page_config=None,config_level='project'):
        self.driver = driver
        self.config.read_options_for('twitter', test_page_config, config_mode=config_level)
        self.default_user = {'login': self.config.login, 'pwd': self.config.pwd}


    @allure.step('Login by user account: {3}')#
    def login(self, sign_in_link , login_form, user_data):
        BasePage.login(self, sign_in_link , login_form, user_data, self.acc_settings)
        return self

    def logout(self):
        try:
            self.click(self.acc_settings,timeout=2)
        except TimeoutException:
            print "USER is LOGED OUT"
            return self
        self.click(self.sign_out_ref,timeout=2)
        self.wait_until_element_is_not_present(self.acc_settings, 6)
        return self
