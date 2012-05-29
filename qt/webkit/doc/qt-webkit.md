
Native qt webkit + node app
===========================

In this article, I'll try to introduce you to the wonderful world of hybrid
web+native app with Qt and its Webkit Bridge, as Sir Ariya Hidayat
demonstrated in a few posts.

> Seems that a lot of people overlook Qt and its built-in WebKit integration.

Seems like it's really true. After spending a bit of time digging into Ariya's
X2 example, tweaking it and making it work (on osx and Win32), I do admit that
I'm a bit excited...

JavaScript and web-based technology have reached a point (and it's not going
to stop) where we can do pretty much anything. Wrapping up a webapp into a Qt
Webkit bridged app is incredibly powerful and provides you an immense amount
of power.

Being a web developer today means we can do some really amazing things like
wrapping up an entire mobile webapp in a WebView, or even a desktop app. It
simply amazes me.

assets.qrc
----------

http://qt-project.org/doc/qt-4.8/resources.html

A Qt webkit application needs to store all the necessary content in the
resource system provided by Qt.

The assets.qrc is what defines each ressource our application needs, thus
allowing its use without Internet connection.

In classical application, most likely used to store contents like images, in a
Qt webkit wrapped app, it'll be static assets like HTML files, CSS or JS (and
images of course if we need to)

A typical assets.qrc file looks like this:

   <!DOCTYPE RCC>
   <RCC>
   <qresource prefix="/">
      <file>index.html</file>
      <file>app.js</file>
      <file>app.css</file>
      <file>img/foo.png</file>
   </qresource>
   </RCC>


If this packaging approach, we ensure users won't need an Internet connection
to load and use the app.

Bridging the two worlds
-----------------------


Conclusion
----------

I'm doing a lot of node cli based tool these days, and I'm really looking
forward something that would let me wrap up a given tool into a clean UI that
can be used by people who avoids the command-line at all cost.

This is why I'm so excited about Qt and its built-in Webkit integration. I can
use node & JavaScript to build a command-line tool, still use node or pure
static web-app to build up the UI, and then wraps all this into a deployable
and single executable.

