# -*- coding: utf-8 -*-
from model_i18n import translator
from highlights.models import Highlight


class HighlightTranslation(translator.ModelTranslation):
    fields = ('title', 'body', 'link', 'file', 'video', 'extra_file')
    master_language = 'en'


translator.register(Highlight, HighlightTranslation)
