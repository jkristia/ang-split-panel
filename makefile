
help:
	@awk -F ':|##' '/^[^\t].+:.*##/ { printf "\033[36mmake %-28s\033[0m -%s\n", $$1, $$NF }' $(MAKEFILE_LIST) | sort

.PHONY: app
app: .app ## run app

.PHONY: test
test: .test ## run unit tests

#---------------------------------------------------------

.app:
	npm start

.test:
	npm run test
