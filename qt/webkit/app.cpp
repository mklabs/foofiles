
#include <QtGui>
#include <QtWebKit>

int main(int argc, char **argv)
{
    QApplication app(argc, argv);
    app.setApplicationName("my super Awesome desktop app");

    // we create a new QWebView, make it point on google and render the view
    QWebView *view = new QWebView();
    view->load(QUrl("http://google.com/"));
    view->show();

    return app.exec();
}
