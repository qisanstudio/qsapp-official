#! /usr/bin/env python
# -*- coding: utf-8 -*-

from flask.ext.babelex import Babel
from studio.core.flask.app import StudioFlask


app = StudioFlask(__name__)

Babel(app=app, default_locale='zh')

with app.app_context():
    from official import views
    from official.panel import admin
    from official.blueprints import blueprint_www
    admin.init_app(app)
    assert views

    app.register_blueprint(blueprint_www)
    app.add_url_rule('/apps/%s/<path:filename>' %
                        app.name, endpoint='static', #subdomain='static',
                        view_func=app.send_static_file)
