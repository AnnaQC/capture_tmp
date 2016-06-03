# -*- coding: utf-8 -*-
"""
Contains functions to handle parsed data
"""
import json
import time
from copy import deepcopy

import allure


def get_actual_data_from_js_console(driver):
    """
    Gets captured data from pattern and erases unused data attributes

    :param driver:
    :return: actual_res: dictionary of captured data without attributes which names contain 'c' and '_'
    """
    #driver.refresh() # update page to get actual results because some times the page is not fully loaded when script is running
    #time.sleep(4)
    wd_log = driver.get_log('browser')
    print "**"*10 + "Data from captured results by pattern" + "**"*10
    for entry in wd_log:

        if '{"c"' in entry['message']:
            msg = entry['message']
            msg = msg[msg.find("{"):msg.rfind("}") + 1].encode('utf-8')
            #
            print msg
            dict_ = json.loads(msg)
            actual_res = deepcopy(dict_)
            #
            for key in dict_:
                if key.startswith('_') or key == 'c':
                    del actual_res[key]
            for value in actual_res.items():
                print "--" * 20
                print value[0] + " :"
                print value[1]
                allure.attach(value[0], json.dumps(value[1]))
            print "***" * 20
            return actual_res


def handle_value_to_print(value):
    """ change type of attribute values to string """
    if value is None:
        value = ''
    elif isinstance(value, unicode):
        value = value.encode("utf-8")
    return value.replace('. ', '.')
