#include "mainview.h"

#include <QtWebKit>

MainView::MainView(QWidget *parent) : QWebView(parent)
{
  load(QUrl("http://localhost:3000"));
  // load(QUrl("qrc:/index.html"));
}

