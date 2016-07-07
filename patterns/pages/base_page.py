# -*- coding: utf-8 -*-
"""
Created on Apr 25, 2016
@author: user
"""
import allure
import time
from allure.constants import AttachmentType
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.action_chains import ActionChains


class BasePage():

    def __init__(self, driver):
        self.driver = driver

    @allure.step('Open page to parse :{1}')
    def open(self, url):
        self.driver.get(url)
        self.attach_screen_to_report(url)


    def set_checkbox(self, locator):
        """
        set checkbox to true if it is unchecked
        :return: checkbox status
        """

        checkbox = self.driver.find_element(*locator)
        if not checkbox.isSelected():
            checkbox.click()
            return True
        return False

    def login(self, sign_in_link, login_form, user_data, element_to_wait=None, timeout=16):
        """
        Method logs in to the system
        :param element_to_wait:
        :param timeout:
        :param sign_in_link: link on sign in form
        :param login_form: dictionary with locators on login form elements
        :param user_data: dictionary with login and password
        """
        if element_to_wait is not None:
            if not self.is_element_present(element_to_wait,1):
                self.driver.get(sign_in_link)
                self.type(login_form['user_field'], user_data['login'])
                self.type(login_form['pwd_field'], user_data['pwd'])
                self.driver.find_element(*login_form['submit_btn']).click()
                self.is_element_present(element_to_wait, timeout)
        else:
            self.driver.get(sign_in_link)
            self.type(login_form['user_field'], user_data['login'])
            self.type(login_form['pwd_field'], user_data['pwd'])
            self.driver.find_element(*login_form['submit_btn']).click()

    def move_to_element_and_click(self, locator_to_move, locator_to_click):
        actions = ActionChains(self.driver)
        if self.is_element_present(locator_to_move, 2):
            element_to_move = self.driver.find_element(*locator_to_move)
            actions.move_to_element(element_to_move)

            if self.is_element_present(locator_to_click, 1):
                element_to_click = self.driver.find_element(*locator_to_click)
                actions.click(element_to_click).perform()

    def is_element_present(self, locator, timeout=3):
        try:
            wait = WebDriverWait(self.driver, timeout)
            wait.until(expected_conditions.presence_of_element_located(locator))
        except WebDriverException:
            return False
        return True

    def type(self, locator, text):
        field = self.driver.find_element(*locator)
        field.clear()
        field.send_keys(text)
        return field

    def click(self, locator, element_to_wait=None, timeout=10):
        wait = WebDriverWait(self.driver, timeout)
        wait.until(expected_conditions.presence_of_element_located(locator)).click()
        if element_to_wait is not None:
            wait.until(expected_conditions.presence_of_element_located(element_to_wait))

    def wait_until_element_is_not_present(self, locator, timeout=5):
        wait = WebDriverWait(self.driver, timeout)
        try:
            wait.until_not(expected_conditions.presence_of_element_located(locator))
            return True
        except WebDriverException: return False

    def get_text_of_element(self, locator):
        """
        Finds a text within an element and returns it in utf8.
        If element is not present on page the method returns None
        :param locator:
        :return: text, None
        """
        try:
            wait = WebDriverWait(self.driver, 3)
            wait.until(expected_conditions.visibility_of_element_located(locator))
            text = self.driver.find_element(*locator).text
            return text.encode('utf8')
        except WebDriverException:
            return None


    def attach_screen_to_report(self, text_label="Screen shot"):
        """
        Attaches screenshot to allure report as file.png
        :param text_label: text label for attachment in allure report which characterizes content of the screen shot
        """
        text_label = unicode(text_label)
        screen = self.driver.get_screenshot_as_png()
        allure.attach(text_label, screen, AttachmentType.PNG)
