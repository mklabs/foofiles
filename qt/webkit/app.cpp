
#include "mainview.h"
#include <QtGui>

int main(int argc, char **argv)
{
  QApplication app(argc, argv);
  app.setApplicationName("my super Awesome desktop app");

  MainView view;
  view.show();

  return app.exec();
}
