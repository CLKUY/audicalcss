# -*- coding: utf-8 -*-
# Generated by Django 1.11.14 on 2019-01-03 18:04
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('highlights', '0002_banner'),
    ]

    operations = [
        migrations.AddField(
            model_name='banner',
            name='title',
            field=models.CharField(default=1, max_length=20, verbose_name='title'),
            preserve_default=False,
        ),
    ]
