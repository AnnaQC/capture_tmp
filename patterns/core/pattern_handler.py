# -*- coding: utf-8 -*-
"""
Contains functions to handle parsed data
"""
import json
import time
from copy import deepcopy
from selenium.common.exceptions import WebDriverException

import allure


def get_actual_data_from_js_console(driver, time_to_wait=3):
    """
    Gets captured data from pattern and erases unused data attributes

    :param driver:
    :return: actual_res: dictionary of captured data without attributes which names contain 'c' and '_'
    """
    driver.current_url
    actual_res = None
    print "**"*10 + "Data from captured results by pattern" + "**"*10
    actual_res = read_capture_result_message_from_js(driver.get_log('browser'))
    if actual_res is None:
        time.sleep(time_to_wait)
        driver.current_url
        actual_res = read_capture_result_message_from_js(driver.get_log('browser'))
        if actual_res is None:
            raise WebDriverException("Captured results were not found within the WEB DRIVER log (browser console) \n.\
            Check workabillity of selection.js of extension and debug driver.get_log('browser') or restart test.")
    return actual_res


def handle_value_to_print(value):
    """ change type of attribute values to string """
    if value is None:
        value = 'None'
    elif isinstance(value, unicode):
         if value is u'':
             value = 'None'
         value = value.encode("utf-8")
    return value.replace('. ', '.')

def read_capture_result_message_from_js(wd_log):
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
    return None