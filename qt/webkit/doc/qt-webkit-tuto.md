qt webkit tuto
==============

In this post, we're going to demonstrate the use of a very (very) simple Qt
webkit app. Our app won't do much, we'll setup the bare minimum for our app to
work, a sinple blank page showing up in a WebView.

It'll highlight some important concepts of developping a Qt Webkit app though
(Note: I don't use the QT Creator IDE, maybe I should. I still think that
being able to build & compile your app from the command-line is important)

I'll also try to explain some really simple steps, not immeditaly obvious
for the neophyte (And I'm still definitely one)

Setting up the barebone webapp
------------------------------

In this section, we'll simply define a main HTML page (index.html) with basic
static assets and basic structure. We'll build on top of what HTML5
Boilerplate provides.

Most of what is comming with the h5bp project won't be needed in our
particular Qt Webkit use case. We pretty much know that we'll always be within
a WebView, and that the main browser engine will be Webkit itself.

So let's do this, download the latest stable release of h5bp (I'm using the
master branch, to get the freshest) and start deleting what you feel won't be
needed in our hybrid native+web app.

Here's what I got, I simply deleted everything except from html files (index &
404) and tweaked the `index.html` to look like the following:

    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
      <title></title>
      <meta name="description" content="">
      <link rel="stylesheet" href="css/style.css">
    </head>
    <body>

      <script src="js/vendor/jquery-1.7.2.min.js"></script>
      <script src="js/main.js"></script>
    </body>
    </html>


And here is the basic file structure, nothing fancy, all this should look familiar:

    ├── 404.html
    ├── index.html
    ├── img/
    ├── css/
    │   └── style.css
    └── js/
        ├── main.js
        └── vendor/
            ├── jquery-1.7.2.js
            └── jquery-1.7.2.min.js


assets.qrc
----------

http://qt-project.org/doc/qt-4.8/resources.html

A Qt webkit application needs to store all the necessary content in the
resource system provided by Qt.

The assets.qrc is what defines each resource our application needs, thus
allowing its use without Internet connection.

In classical application, most likely used to store contents like images, in a
Qt webkit wrapped app, it'll be static assets like HTML files, CSS or JS (and
images of course if we need to)

Our assets.qrc file will look like this:

    <!DOCTYPE RCC>
    <RCC>
      <qresource prefix="/">
        <file>index.html</file>
        <file>css/style.css</file>
        <file>js/main.js</file>
        <file>js/vendor/jquery-1.7.2.js</file>
        <file>js/vendor/jquery-1.7.2.min.js</file>
      </qresource>
    </RCC>

With this packaging approach, we ensure users won't need an Internet connection
to load and use the app.


Meet qmake
----------

I should probably add a note or a full section on getting the QT Sdk installed
on your machine. I'll assumed it's already done and if it's not, I'll simply
give you the link to the download page.

qmake comes with the Qt Sdk, and is a tool that aims to simplify (actually it
**greatly** simplifies) the build process for developing project across
platforms.

> qmake is a tool that helps simplify the build process for development
> project across different platforms. qmake automates the generation of
> Makefiles so that only a few lines of information are needed to create each
> Makefile. qmake can be used for any software project, whether it is written
> in Qt or not.

In a nutshell, the basic workflow is something like:

* qmake --project: This puts qmake intro project generation mode. It's handy
  when starting a new project.
* qmake: Generate the according Makefile.
* make: (or mingw32-make on windows) Actually build & compiles the project

So, from what we have setup in the previous step, we're going to run the
`qmake --project` step.

Go to the root of the project, where our main assets are, and then run the command:

    $ cd /path/to/my/app
    $ qmake --project

You should now see a new file, the `.pro` file of your project (usually named
after the name of the base dir). This is the Qt project file.

http://qt-project.org/doc/qt-4.8/qmake-project-files.html

And here is what qmake generated with this sample:

    TEMPLATE = app
    TARGET =
    DEPENDPATH += .
    INCLUDEPATH += .

    # Input
    RESOURCES += assets.qrc

This is what qmake generated from this basic blank app. Our final project file
will look like something like this:

    SOURCES = app.cpp another-file.cpp
    HEADERS = app.h another-app.h
    RESOURCES = assets.qrc
    QT += network webkit


Really similar, and actually based on Ariya's codemirror example.


Our main Qt application class
-----------------------------

So, now let's actually write some code. This is the main entry point of your
application and usually is something like (again borrowed from codemirror
desktop sample)


    #include <QtGui>

    int main(int argc, char **argv)
    {
      QApplication app(argc, argv);
      app.setApplicationName("my super Awesome desktop app");
      return app.exec();
    }


This should be all we need to get started and have a runnable executable.
Let's try to rerun `qmake -project`, just to see how it goes.

qmake automatically detected a new source file, and added it accordinly to your project file:

    # Input
    SOURCES += app.cpp
    RESOURCES += assets.qrc

Generate the Makefile
---------------------

So far, we only used qmake in project mode. Let's now generate the Makefile,
shall we? This is simply done by calling `qmake` alone.

    $ qmake

And you should see a new generate Makefile, with a pretty long content (well,
that's why qmake is so handy). It should include all the necessary
configuration to build & compile the project, depending on your environment
and OS.

Eventually, it will also create two separate Makefile, one for realease and
one for debug (Makefile.Debug and Makefile.Release) alonside two directories:
debug/ and release/.

Make
----

In this section, we'll just use the make executable (or mingw32-make on
windows) to build & compile our project, based on the generated Makefile.

    $ make

And you should see no warning or compilation errors at this point (well our
app only consists of 3 lines of code for now). Here's an output sample on osx
platform:

> todo, replace with osx thing.

    mingw32-make -f Makefile.Debug
    mingw32-make[1]: Entering directory `C:/Users/a511053/src/qt-tests/X2/webkit/qt-webkit-boilerplate'
    g++ -c -g -frtti -fexceptions -mthreads -Wall -DUNICODE -DQT_LARGEFILE_SUPPORT -
    DQT_DLL -DQT_GUI_LIB -DQT_CORE_LIB -DQT_HAVE_MMX -DQT_HAVE_3DNOW -DQT_HAVE_SSE -
    DQT_HAVE_MMXEXT -DQT_HAVE_SSE2 -DQT_THREAD_SUPPORT -DQT_NEEDS_QMAIN -I"d:\QtSDK\
    Desktop\Qt\4.7.4\mingw\include\QtCore" -I"d:\QtSDK\Desktop\Qt\4.7.4\mingw\includ
    e\QtGui" -I"d:\QtSDK\Desktop\Qt\4.7.4\mingw\include" -I"." -I"d:\QtSDK\Desktop\Q
    t\4.7.4\mingw\include\ActiveQt" -I"debug" -I"d:\QtSDK\Desktop\Qt\4.7.4\mingw\mks
    pecs\default" -o debug\app.o app.cpp
    d:\QtSDK\Desktop\Qt\4.7.4\mingw\bin\rcc.exe -name assets assets.qrc -o debug\qrc
    _assets.cpp
    g++ -c -g -frtti -fexceptions -mthreads -Wall -DUNICODE -DQT_LARGEFILE_SUPPORT -
    DQT_DLL -DQT_GUI_LIB -DQT_CORE_LIB -DQT_HAVE_MMX -DQT_HAVE_3DNOW -DQT_HAVE_SSE -
    DQT_HAVE_MMXEXT -DQT_HAVE_SSE2 -DQT_THREAD_SUPPORT -DQT_NEEDS_QMAIN -I"d:\QtSDK\
    Desktop\Qt\4.7.4\mingw\include\QtCore" -I"d:\QtSDK\Desktop\Qt\4.7.4\mingw\includ
    e\QtGui" -I"d:\QtSDK\Desktop\Qt\4.7.4\mingw\include" -I"." -I"d:\QtSDK\Desktop\Q
    t\4.7.4\mingw\include\ActiveQt" -I"debug" -I"d:\QtSDK\Desktop\Qt\4.7.4\mingw\mks
    pecs\default" -o debug\qrc_assets.o debug\qrc_assets.cpp
    g++ -mthreads -Wl,-subsystem,windows -o debug\qt-webkit-boilerplate.exe debug/ap
    p.o debug/qrc_assets.o  -L"d:\QtSDK\Desktop\Qt\4.7.4\mingw\lib" -lmingw32 -lqtma
    ind -lQtGuid4 -lQtCored4 -LC:\OpenSSL-Win32_full\lib
    mingw32-make[1]: Leaving directory `C:/Users/a511053/src/qt-tests/X2/webkit/qt-webkit-boilerplate'










