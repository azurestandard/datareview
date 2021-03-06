# datareview - Generic client-side UI for data parsing and/or review

Caution: This project is pre-alpha - everything is subject to change.

The purpose of this project is to provide a (hopefully) pragmatic generic client-side user interface for the purposes of parsing and reviewing data from a REST-ish backend.  The ```datareview_config``` variable defines one or more endpoints that will be listed on the _Overview_ page.  An example is as follows:

```js
var datareview_config = {
    home_label: 'datareview Home',
    home_url: 'https://github.com/azurestandard/datareview',
    // overview_label: 'Overview Label',
    // overview_nav_label: 'Overview Nav Label',
    // bulk_label: 'Bulk Label',
    // bulk_nav_label: 'Bulk Nav Label',
    // individual_label: 'Individual Label',
    // individual_nav_label: 'Individual Nav Label',
    // default_text: 'Overview default text:',
    endpoints: [
        {
            key: 'prod_description',
            label_for_overview: 'Product Description Parsing and Review',
            bulk_label: 'Bulk Review of Product Descriptions',
            individual_label: 'Individual Review of a Product Description',
            action: '/individual/prod_description/7314',
            // action: '/bulk/',
            // todo: replace individual endpoint w/ bulk endpoint stuff ...
            js: {
                // note these files can be anywhere that is *trustworthy*;
                // they will be loaded dynamically using $script.js ...
                parsing_rules: 'js/parsing_rules.js',
                view: 'js/view.js'
            },
            url: 'http://example.com/prod_description/:id/datareview'
        }
    ]
```

  When a user selects one of these endpoints, the appropriate js for that endpoint will be loaded, if needed, and the UI will update to match that endpoint's configuration.  So, for example, if you are wanting to parse a product description from one field into multiple fields on the backend, along with an interface to allow a user to review and apply the changes that might be one endpoint.  Another endpoint might be for a completely unrelated purpose.  Within each endpoint, the _js_ property contains a specific object detailing where to find ```parsing_rules``` and ```view``` related code.  _For now, both are required._

  The _Bulk Review_ area will likely contain a datagrid where a user can apply quick changes in bulk and/or select an individual item to review.  The _Individual Review_ area is for more fine-tuned changes and more detailed review.  The interface handling for _Individual Review_ is still being determined.  The idea is to keep as much in the view.js (or whatever the user calls it) for each endpoint.  How to do that in an _Angular_ way is an interesting topic that is being explored.

## Getting Started

To get you started you can simply clone the datareview repository and install the dependencies (see prerequisites).

### Prerequisites

Since this is based on angular-seed, the same prerequistes are required:

You need git to clone the datareview repository. You can get it from
[http://git-scm.com/](http://git-scm.com/).

We also use a number of node.js tools to initialize and test angular-seed. You must have node.js and
its package manager (npm) installed.  You can get them from [http://nodejs.org/](http://nodejs.org/).

### Clone datareview

Clone the datareview repository using [git][git]:

```
git clone https://github.com/azurestandard/datareview.git
cd datareview
```

### Install Dependencies

We have two kinds of dependencies in this project: tools and angular framework code.  The tools help
us manage and test the application.

* We get the tools we depend upon via `npm`, the [node package manager][npm].
* We get the angular code via `bower`, a [client-side code package manager][bower].

We have preconfigured `npm` to automatically run `bower` so we can simply do:

```
npm install
```

Behind the scenes this will also call `bower install`.  You should find that you have two new
folders in your project.

* `node_modules` - contains the npm packages for the tools we need
* `app/bower_components` - contains the angular framework files

*Note that the `bower_components` folder would normally be installed in the root folder but
angular-seed changes this location through the `.bowerrc` file.  Putting it in the app folder makes
it easier to serve the files by a webserver.*

### Configure your installation

Setup your `datareview_config` by editing `app/index.html`:

    <!-- your config script goes here (something along the lines of) ...
         <script src="js/datareview/config.js"></script>-->
         <script src="http://example.com/static/js/datareview/config.js"></script>

which defines `datareview_config` as outlined above.

### Run the Application

We have preconfigured the project with a simple development web server.  The simplest way to start
this server is:

```
npm start
```

Now browse to the app at `http://localhost:8000/app/index.html`.



## Directory Layout

    app/                --> all of the files to be used in production
      css/              --> css files
        app.css         --> default stylesheet
      img/              --> image files
      index.html        --> app layout file (the main html template file of the app)
      index-async.html  --> just like index.html, but loads js files asynchronously
      js/               --> javascript files
        app.js          --> application
        controllers.js  --> application controllers
        directives.js   --> application directives
        filters.js      --> custom angular filters
        services.js     --> custom angular services
      partials/             --> angular view partials (partial html templates)
        partial1.html
        partial2.html

    test/               --> test config and source files
      protractor-conf.js    --> config file for running e2e tests with Protractor
      e2e/                  --> end-to-end specs
        scenarios.js
      karma.conf.js         --> config file for running unit tests with Karma
      unit/                 --> unit level specs/tests
        controllersSpec.js      --> specs for controllers
        directivessSpec.js      --> specs for directives
        filtersSpec.js          --> specs for filters
        servicesSpec.js         --> specs for services


## Testing

_Not there for this project right now._

There are two kinds of tests in the angular-seed application: Unit tests and End to End tests.

### Running Unit Tests

The angular-seed app comes preconfigured with unit tests. These are written in
[Jasmine][jasmine], which we run with the [Karma Test Runner][karma]. We provide a Karma
configuration file to run them.

* the configuration is found at `test/karma.conf.js`
* the unit tests are found in `test/unit/`.

The easiest way to run the unit tests is to use the supplied npm script:

```
npm test
```

This script will start the Karma test runner to execute the unit tests. Moreover, Karma will sit and
watch the source and test files for changes and then re-run the tests whenever any of them change.
This is the recommended strategy; if your unit tests are being run every time you save a file then
you receive instant feedback on any changes that break the expected code functionality.

You can also ask Karma to do a single run of the tests and then exit.  This is useful if you want to
check that a particular version of the code is operating as expected.  The project contains a
predefined script to do this:

```
npm run test-single-run
```


### End to end testing

The angular-seed app comes with end-to-end tests, again written in [Jasmine][jasmine]. These tests
are run with the [Protractor][protractor] End-to-End test runner.  It uses native events and has
special features for Angular applications.

* the configuration is found at `test/protractor-conf.js`
* the end-to-end tests are found in `test/e2e/`

Protractor simulates interaction with our web app and verifies that the application responds
correctly. Therefore, our web server needs to be serving up the application, so that Protractor
can interact with it.

```
npm start
```

In addition, since Protractor is built upon WebDriver we need to install this.  The angular-seed
project comes with a predefined script to do this:

```
npm run update-webdriver
```

This will download and install the latest version of the stand-alone WebDriver tool.

Once you have ensured that the development web server hosting our application is up and running
and WebDriver is updated, you can run the end-to-end tests using the supplied npm script:

```
npm run protractor
```

This script will execute the end-to-end tests against the application being hosted on the
development server.


## Updating Angular

Previously we recommended that you merge in changes to angular-seed into your own fork of the project.
Now that the angular framework library code and tools are acquired through package managers (npm and
bower) you can use these tools instead to update the dependencies.

You can update the tool dependencies by running:

```
npm update
```

This will find the latest versions that match the version ranges specified in the `package.json` file.

You can update the Angular dependencies by running:

```
bower update
```

This will find the latest versions that match the version ranges specified in the `bower.json` file.


## Serving the Application Files

While angular is client-side-only technology and it's possible to create angular webapps that
don't require a backend server at all, we recommend serving the project files using a local
webserver during development to avoid issues with security restrictions (sandbox) in browsers. The
sandbox implementation varies between browsers, but quite often prevents things like cookies, xhr,
etc to function properly when an html page is opened via `file://` scheme instead of `http://`.


### Running the App during Development

The angular-seed project comes preconfigured with a local development webserver.  It is a node.js
tool called [http-server][http-server].  You can start this webserver with `npm start` but you may choose to
install the tool globally:

```
sudo npm install -g http-server
```

Then you can start your own development web server to serve static files from a folder by
running:

```
http-server
```

Alternatively, you can choose to configure your own webserver, such as apache or nginx. Just
configure your server to serve the files under the `app/` directory.


### Running the App in Production

This really depends on how complex is your app and the overall infrastructure of your system, but
the general rule is that all you need in production are all the files under the `app/` directory.
Everything else should be omitted.

Angular apps are really just a bunch of static html, css and js files that just need to be hosted
somewhere they can be accessed by browsers.

If your Angular app is talking to the backend server via xhr or other means, you need to figure
out what is the best way to host the static files to comply with the same origin policy if
applicable. Usually this is done by hosting the files by the backend server or through
reverse-proxying the backend server(s) and webserver(s).


## Contact

For more information on AngularJS please check out http://angularjs.org/

[git]: http://git-scm.com/
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[protractor]: https://github.com/angular/protractor
[jasmine]: http://pivotal.github.com/jasmine/
[karma]: http://karma-runner.github.io
[travis]: https://travis-ci.org/
[http-server]: https://github.com/nodeapps/http-server


## License

MIT
