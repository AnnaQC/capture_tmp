# -*- coding: utf-8 -*-
"""
Created on Apr 25, 2016

@author: user

"""
import allure
from selenium.webdriver.common.by import By

from pages.base_page import BasePage
from  core.config_reader import ReadConfigs


class LinkidinProfilePage(BasePage):
    url =  ReadConfigs().read_options_for('linkedin')
    # Locators
    full = (By.XPATH, "//span[@class='full-name']")  # user name
    companyTitle = (By.XPATH, "//*[@id='headline']/p'")  # is used in expirience as 'CompanyTitle' value
    twitter = (By.XPATH, "//*[@id='twitter-view']//li//a")  # twitter link is displayed in contact info tab
    linkedin = (By.XPATH, "//*[@class='public-profile']//a")  # linkidin profile link
    jobtitle = (By.XPATH,
                ".//*[div[starts-with(@id, 'experience') and contains(@id, '-view')]][1]//h4")  # .//*[@class='position'][1]//h4[@class='item-title']")# for user that is not logged in
    company = (By.XPATH,
               ".//*[div[starts-with(@id, 'experience') and contains(@id, '-view')]][1]//h5[last()]")  # (By.XPATH, ".//*[@class='position'][1]//h5[@class='item-subtitle']")# for unlogined user
    bio = (By.XPATH, ".//div[@class = 'summary']/p")
    city = (By.XPATH, ".//*[@class='locality']//a")
    email = (By.XPATH, ".//*[@id='email-view']//a")  # link is displayed in contact info tab
    #experience = (By.XPATH, ".//*[contains(@class, 'description')]")#add tomorrow
    # ---tab to show more info
    contact_info_tab = (By.XPATH, '//*[@id="contact-info-tab"]')
    expanded_contact_info = (
        By.XPATH, "//div[contains(@class,'expanded-view') and contains(@class,'profile-top-card')]")

    def __init__(self, driver, is_logged=True):
        """
        Initialise page content to test for logged in user(one type of pattern) or user that is not logged in (other type of pattern for linkedin profile)
        by default we init page for logged in user
        :param driver:
        :param is_logged:
        """
        self.driver = driver
        if is_logged:
            self.locators = dict(bio=self.bio, full=self.full, company=self.company, linkedin=self.linkedin,
                                 twitter=self.twitter, city=self.city, jobtitle=self.jobtitle,
                                 email=self.email)#, experience=self.experience)
            # print "Simplified locators dictionary = " + str(self.locators)

    @allure.step('Open page to parse :{1}' )
    def open(self, external_page_url=None):
        """
        Opens page url specified from config file if external_page_url is None else opens url that is specified as external_page_url
        :param external_page_url: address of page to test
        :return:
        """
        if external_page_url is not None:
            self.url = external_page_url
        self.driver.get(self.url)
        self.attach_screen_to_report(self.url)
        return self

    def expand_contact(self):
        self.click(self.contact_info_tab, self.expanded_contact_info)
        return self

    def parse_text(self):
        print "**" * 10 + " Data from page that User have to see" + "**" * 10
        keys = self.locators.keys()
        parsed_text = dict.fromkeys(keys)

        for key in keys:
            if key is ('twitter' or 'email'):
                self.expand_contact()
            parsed_text[key] = self.get_text_of_element(self.locators[key])

        parsed_text['first'], parsed_text['last'] = self.separate_fullname(parsed_text['full'])

        for key in parsed_text.keys():
            allure.attach(key, str(parsed_text[key]))
            print "\n"+"--"*20 + "\n"
            print key + " : " + str(parsed_text[key])
        print "\n" + "***"*20
        return self.prepare_data_to_compare(parsed_text)

    def prepare_data_to_compare(self, parsed_data):
        linkidin = parsed_data['linkedin']
        if linkidin.find("www.") is not -1:
            part_to_remove= linkidin.find("www.") + 4
        else :
            part_to_remove = linkidin.find("//") + 2
        parsed_data['linkedin'] = linkidin[part_to_remove:]
        print parsed_data['linkedin']
        return parsed_data


    @staticmethod
    def separate_fullname(fullname):
        first, last = fullname.split(" ", 1)
        return first, last


# all possible keys list, that will used to get expected text by pattern from page( and text
ptrn_keys = {'phone1src', 'bio', 'twitter', 'venues', 'email', 'id', 'city', 'sourceurl', 'zip', 'jobtitle',
             'mark',
             'state', 'flags', 'company', 'website', 'employeesAvg', 'full', 'phone2', 'address1', 'address2',
             'phone',
             'facebook', 'linkedin', 'emailverbool', 'data', 'last', 'country', 'experience', 'revenueAvg',
             'email2verbool',
             'first'}
locators = dict.fromkeys(ptrn_keys)
