#! /usr/bin/env python
# -*- coding: UTF-8 -*-

import os
import sys
import setuptools

from distutils.command.clean import clean as _clean
from distutils.command.build import build as _build
from setuptools.command.sdist import sdist as _sdist
from setuptools.command.build_ext import build_ext as _build_ext

try:
    import multiprocessing
    assert multiprocessing
except ImportError:
    pass


def strip_comments(l):
    return l.split('#', 1)[0].strip()


def reqs(filename):
    with open(os.path.join(os.getcwd(),
                           'requirements',
                           filename)) as fp:
        return filter(None, [strip_comments(l)
                            for l in fp.readlines()])

setup_ext = {}

if os.path.isfile('gulpfile.js'):
    # 如果 gulpfile.js 存在, 就压缩前端代码
    def gulp_build(done=[]):
        if not done:
            if os.system('npm install '
                         '--disturl=http://dist.u.qiniudn.com '
                         '--registry=http://r.cnpmjs.org'):
                sys.exit(1)
            if os.system('bower install'):
                sys.exit(1)
            if os.system('gulp build'):
                sys.exit(1)
            done.append(1)

    def gulp_clean(done=[]):
        if not done:
            if os.system('npm install '
                         '--disturl=http://dist.u.qiniudn.com '
                         '--registry=http://r.cnpmjs.org'):
                sys.exit(1)
            if os.system('gulp clean'):
                sys.exit(1)
            done.append(1)

    class build(_build):

        sub_commands = _build.sub_commands[:]

        # force to build ext
        for ix, (name, checkfunc) in enumerate(sub_commands):
            if name == 'build_ext':
                sub_commands[ix] = (name, lambda self: True)

    class build_ext(_build_ext):

        def run(self):
            gulp_build()
            _build_ext.run(self)

    class sdist(_sdist):

        def run(self):
            gulp_build()
            _sdist.run(self)

    class clean(_clean):

        def run(self):
            _clean.run(self)
            gulp_clean()

    setup_ext = {'cmdclass': {'sdist': sdist,
                              'clean': clean,
                              'build': build,
                              'build_ext': build_ext}}

setup_params = dict(
    name="qsapp-official",
    url="http://wiki.yimiqisan.com/",
    version='1.0',
    author="qisan",
    author_email="qisanstudio@gmail.com",
    packages=setuptools.find_packages('src'),
    package_dir={'': 'src'},
    include_package_data=True,
    zip_safe=False,
    install_requires=reqs('install.txt'))

setup_params.update(setup_ext)


if __name__ == '__main__':
    setuptools.setup(**setup_params)