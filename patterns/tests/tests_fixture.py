# -*- coding: utf-8 -*-

import os
import platform
import pytest

from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

from core import config_reader

@pytest.fixture(scope = "module")
def chromedriver(request):
    """
        set up webdriver according to OS properties
    """
    config = config_reader.ReadConfigs('../config.ini')
    print config.chromdriver_linux
    _platform = platform.system().lower()

    if 'darwin' in _platform:
        path_to_driver = os.path.abspath(os.getcwd() + '/../' + config.chromdriver_mac)
    elif 'linux' in _platform:
        path_to_driver = os.path.abspath(os.getcwd() + '/../' + config.chromdriver_linux)
    elif 'win' in _platform:
        path_to_driver = os.path.abspath(os.getcwd() + '/../' + config.chromdriver_win)
    path_to_extension_dir = os.path.abspath(os.getcwd() + "/../" + config.test_extention_dir)
    # enable browser logging
    capabilities = DesiredCapabilities.CHROME
    capabilities['loggingPrefs'] = {'driver': 'INFO', 'browser': 'ALL'}

    options = webdriver.ChromeOptions()
    options.add_argument("load-extension=" + path_to_extension_dir)
    driver = webdriver.Chrome('/home/user/git/capture-chrome-extension-tests/patterns/resources/drivers/chromedriver')
    driver.maximize_window()
    request.addfinalizer(driver.quit)
    return driver

