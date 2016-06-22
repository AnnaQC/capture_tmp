# -*- coding: utf-8 -*-
import ConfigParser
import allure
from ConfigParser import NoOptionError, NoSectionError

class ReadConfigs():

    path_to_config = '../config.ini'

    def __init__(self, _path_to_config=None):
        self.config = ConfigParser.ConfigParser()
        if _path_to_config is not None:
            self.path_to_config = _path_to_config
        self.config.read(self.path_to_config)
        self.get_opt_to_setup_chromedriver()

    def read_options_for(self, section, test_page_config=None, config_mode='project'):
        """
        reads properties from section [linkedin,twitter,etc] to open test page and authorize
        with default config_mode='project'
        :param
        test_page_config: path to test page file with section 'profile' to test
        if it is specified we read url from the test page config file
        if not we read the option test_page from ../config.ini and than read url from the read filename
        config_mode: 'project' or 'page' - level of config file where we get login and pwd options,
                project - method reads login and pwd from ../config.ini file,
                    if there is no section or option in file reads options from test_page_config file
                page - method reads login and pwd from the test_page_config file,
                    if there is no section or option in file, reads options from the ../config.ini
        :return: first linkedin profile URL
        """
        if test_page_config is None:
            test_pages = self.config.get(section, 'tested_page').split()
            test_page_config = '..' + self.config.get('project', section +'_test_data')\
                               + test_pages[0]
        if config_mode is 'project':
            try:
                return self.read_basic_opt(test_page_config, 'profile', section)
            except (NoSectionError, NoOptionError):
                return self.read_basic_opt(test_page_config, 'profile', 'profile')
        else:
            try:
                return self.read_basic_opt(test_page_config, 'profile', 'profile')
            except (NoSectionError, NoOptionError):
                return self.read_basic_opt(test_page_config, 'profile', section)


    def read_basic_opt(self, test_page_config, section_from_page_config, default_section):
        """
        reads properties url, login, password from specified sections
        : test_page_config: path to test page config file
        : section_from_page_config: section from test page config or any other file where test page url is present
        : default_section: section from project config file or any other file where test page login and pwd are present
        :return: first linkedin profile URL
        """
        self.config.read(test_page_config)
        self.url = self.config.get(section_from_page_config, 'url').split()
        self.login = self.config.get(default_section, 'login')
        self.pwd = self.config.get(default_section, 'pwd')
        return self.url[0]


    def get_opt_to_setup_chromedriver(self, path_to_config='../config.ini'):
        """
        Inits path to chromedriver and directory of tested extension that are used to run tests on different OS
        :param path_to_config: ../config.ini by default
        """
        section = 'project'
        self.chromdriver_linux = self.config.get(section, 'chromedriver')
        self.chromdriver_win = self.config.get(section, 'chromedriver_win')
        self.chromdriver_mac = self.config.get(section, 'chromedriver_mac')
        self.test_extention_dir = self.config.get(section, 'test_extention_dir')
        self.linkedin_test_data = self.config.get(section, 'linkedin_test_data')
        self.twitter_test_data = self.config.get(section, 'twitter_test_data')

    #---------------------

    def get_tested_pages_for(self, section):
        """
        Read property 'tested_page' that contains set of filenames with test data.
        :param section: section of config file that contains parameter 'test_pages'
        :return:
        """
        self.tested_pages = self.config.get(section, 'tested_page').split()
        print self.tested_pages
        return self.tested_pages

    def read_expected_results_from_file(self, filename, section):
        """
        reads specified
        :param filename: path to config file with test page data
        :param section: section of properties that should be tested
        :return: dictionary with expected results
        """
        options = self.convert_to_dict(filename)
        for option, value in options[section].items():
            allure.attach(option, value)
        return options[section]

    def convert_to_dict(self, filename):
        """
        reads all properties from configuration file as dictionary
        :param filename: path to config file
        :return:
        """
        _config=ConfigParser.ConfigParser()
        _config.read(filename)
        options = dict.fromkeys(_config.sections(), {})
        for d_key in options:
            prop = {}
            items = _config.items(d_key)
            for key, value in items:
                if '\\n' in value:
                    value = value.replace('\\n', '\n')
                prop[key] = value
            options[d_key] = prop
        return options
