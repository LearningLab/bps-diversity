#!/usr/bin/env python
"""
Make URLs for each CSV file
"""
import json
import os
from glob import glob

OUTFILE = "js/urls.js"

JS_TEMPLATE = u"""\
var URLS = {0};
"""

def main():
    data = {}
    for filename in glob('data/*.csv'):
        year = os.path.splitext(os.path.basename(filename))[0]
        data[year] = filename

    js = JS_TEMPLATE.format(json.dumps(data))

    with open(OUTFILE, 'w') as f:
        f.write(js)


if __name__ == "__main__":
    main()