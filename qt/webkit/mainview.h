#ifndef MAINVIEW
#define MAINVIEW

#include <QWebView>
#include <QWidget>

class MainView: public QWebView
{
  Q_OBJECT

public:
  MainView(QWidget *parent = 0);

};

#endif

