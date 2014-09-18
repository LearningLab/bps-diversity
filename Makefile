

enrollment:
	mkdir -p data/csv
	python fetch.py

db: enrollment
	python db.py

csv: db
	datafreeze Freezefile.yaml
	python urls.py

clean:
	rm -rf data/csv
	rm data/*.csv
	rm bps.db

publish:
	git push origin master
	git push origin master:gh-pages