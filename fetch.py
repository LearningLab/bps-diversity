#!/usr/bin/env python
"""
Fetch annual racial breakdown data for MA public schools
"""
import csv
import os
import requests

from BeautifulSoup import BeautifulSoup

FILENAME = "data/csv/enrollment-all-{}.csv"
URL = "http://profiles.doe.mass.edu/state_report/enrollmentbyracegender.aspx"
YEARS = range(1994, 2015)

def fetch(year):
    """
    Get a year of data. Save as XLSX.
    """
    params = {
        'mode': 'school',
        'year': year,
        'Continue.x': 5,
        'Continue.y': 8,
        'export_excel': 'yes'
    }

    print "Downloading {}".format(year)
    r = requests.get(URL, params=params)

    # write a csv
    table2csv(r.content, FILENAME.format(year))


def table2csv(page, filename):
    """
    Convert XLS as HTML to CSV
    """
    soup = BeautifulSoup(page)
    table = soup.find('table')
    header = [td.text.strip().replace('&nbsp;', '') for td in table.find('tr').findAll('td')]
    rows = table.findAll('tr')[1:]

    with open(filename, 'w') as f:
        writer = csv.writer(f)
        writer.writerow(header)

        for row in rows:
            writer.writerow([td.text.strip().replace('&nbsp;', '') for td in row.findAll('td')])


def main():
    """
    Fetch and save all YEARS
    """
    for year in YEARS:
        if not os.path.exists(FILENAME.format(year)):
            fetch(year)


if __name__ == "__main__":
    main()