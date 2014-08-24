
year2014="http://profiles.doe.mass.edu/state_report/enrollmentbyracegender.aspx?mode=school&year=2014&Continue.x=5&Continue.y=8&export_excel=yes"
year1994="http://profiles.doe.mass.edu/state_report/enrollmentbyracegender.aspx?mode=school&year=1994&Continue.x=8&Continue.y=1&export_excel=yes"

data/xls/enrollment-1994.xlsx:
	mkdir -p $(dir $@)
	curl $(year1994) > $@

data/xls/enrollment-2014.xlsx:
	mkdir -p $(dir $@)
	curl $(year2014) > $@

data/csv/boston-1994.csv: data/xls/enrollment-1994.xlsx
	mkdir -p $(dir $@)
	in2csv data/xls/enrollment-1994.xlsx | tail -n +7 | csvgrep -c 1 -r "^Boston -" > $@

data/csv/boston-2014.csv: data/xls/enrollment-2014.xlsx
	mkdir -p $(dir $@)
	in2csv data/xls/enrollment-2014.xlsx | tail -n +7 | csvgrep -c 1 -r "^Boston -" > $@

bps.db: data/csv/boston-2014.csv data/csv/boston-1994.csv
	python db.py

csv: bps.db
	datafreeze Freezefile.yaml

clean:
	rm -rf data/csv
	rm data/*.csv
	rm bps.db