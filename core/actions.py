# -*- coding: utf-8 -*-
"""
Created on Apr 26, 2016

@author: user

"""


def login(driver, page):
    """
    login to selected website
    selected page class should have attributes with next structure:
    sign_in_link - text link to login form
    default_user = {
                    'login': some_username,
                    'pwd': some_password
                    }
    login_form = {
                  'user_field':(By,selector),
                  'pwd_field':(By, selector),
                  'submit_btn':(By, selector)
                  }

    :param driver:
    :param page:
    :return:
    """
