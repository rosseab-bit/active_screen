#!/bin/bash

case "$1" in
  up)
    echo "🚀 Levantando aplicación..."
    docker compose up -d --build
    ;;

  down)
    echo "🛑 Deteniendo aplicación..."
    docker compose down
    ;;

  restart)
    echo "🔄 Reiniciando aplicación..."
    docker compose restart
    ;;

  logs)
    echo "📜 Mostrando logs..."
    docker compose logs -f
    ;;

  build)
    echo "🔨 Reconstruyendo imagen..."
    docker compose build
    ;;

  rebuild)
    echo "♻️ Reconstruyendo y recreando contenedores..."
    docker compose up -d --build --force-recreate
    ;;

  *)
    echo "Uso: ./deploy.sh {up|down|restart|logs|build|rebuild}"
    exit 1
    ;;
esac