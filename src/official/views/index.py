# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from flask import request, views, render_template

import re
from studio.core.engines import db
from official.blueprints import blueprint_www


class IndexView(views.MethodView):
    '''
        首页
    '''

    def get(self):
        return render_template('www/index.html')


blueprint_www.add_url_rule('/', view_func=IndexView.as_view(b'index'),
                                endpoint='index', methods=['GET'])
