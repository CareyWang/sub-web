#!/bin/bash

magick ./public/favicon.png -resize 16  ./public/img/icons/favicon-16x16.png
magick ./public/favicon.png -resize 32  ./public/img/icons/favicon-32x32.png

magick ./public/favicon.png -resize 192  ./public/img/icons/android-chrome-192x192.png
magick ./public/favicon.png -resize 512  ./public/img/icons/android-chrome-512x512.png

magick ./public/favicon.png -resize 192  ./public/img/icons/android-chrome-maskable-192x192.png
magick ./public/favicon.png -resize 512  ./public/img/icons/android-chrome-maskable-512x512.png


magick ./public/favicon.png -resize 60  ./public/img/icons/apple-touch-icon-60x60.png
magick ./public/favicon.png -resize 76  ./public/img/icons/apple-touch-icon-76x76.png
magick ./public/favicon.png -resize 120  ./public/img/icons/apple-touch-icon-120x120.png
magick ./public/favicon.png -resize 152  ./public/img/icons/apple-touch-icon-152x152.png
magick ./public/favicon.png -resize 180  ./public/img/icons/apple-touch-icon-180x180.png
magick ./public/favicon.png -resize 60  ./public/img/icons/apple-touch-icon.png

magick ./public/favicon.png -resize 144  ./public/img/icons/msapplication-icon-144x144.png
magick ./public/favicon.png -resize 150  ./public/img/icons/mstile-150x150.png


magick ./public/img/icons/favicon-32x32.png ./public/img/icons/favicon-16x16.png ./public/favicon.ico
