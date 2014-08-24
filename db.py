#!/usr/bin/env python
"""
Put racial breakdown stats for BPS schools into a database
"""
import csv
import dataset
import sqlalchemy

db = dataset.connect('sqlite:///bps.db')

RACE_FIELDS = ('AfricanAmerican', 'Asian', 'Hispanic', 'NativeAmerican', 'White')

NUMERIC_TYPES = {
    'AfricanAmerican': sqlalchemy.Numeric,
    'Asian': sqlalchemy.Numeric,
    'Females': sqlalchemy.Numeric,
    'Hispanic': sqlalchemy.Numeric,
    'Males': sqlalchemy.Numeric,
    'NativeAmerican': sqlalchemy.Numeric,
    'White': sqlalchemy.Numeric,
    'PacificIslander': sqlalchemy.Numeric,

    'year': sqlalchemy.Integer,
}


def load(f, year):
    """
    Load csv data from an open file into a database.

    Splits SCHOOL field into District - School.
    All other fields get imported.

    Spaces get removed from headers because SQL, so
    "African American" becomes "AfricanAmerican".
    """
    reader = csv.DictReader(f)
    reader.fieldnames = [h.replace(' ', '') for h in reader.fieldnames]

    reader = list(reader)
    table = db['schools']

    for row in reader:
        district, school = row.pop('SCHOOL').split(' - ', 1)
        row['district'] = district
        row['school'] = school
        row['year'] = year

        # fields were renamed in later years, so rename and default to zero
        row['PacificIslander'] = row.pop('NativeHawaiian,PacificIslander', 0)
        row['Multi'] = row.pop('Multi-Race,Non-Hispanic', 0)

        # lots of error checking here
        for field in NUMERIC_TYPES:
            try:
                row[field] = safe_type(row[field], float, 0)
            except Exception, e:
                print row['school']
                print row[field]
                raise e

        # last bit, stash a total for later filtering
        row['total'] = sum(row[d] for d in RACE_FIELDS)

            
    table.insert_many(reader, types=NUMERIC_TYPES)


def safe_type(obj, cast, default=None):
    "Safe type casting with a default"
    try:
        return cast(obj)
    except (ValueError, TypeError), e:
        return default


if __name__ == "__main__":
    for year in [1994, 2014]:
        with open('data/csv/boston-%i.csv' % year) as f:
            load(f, year)
