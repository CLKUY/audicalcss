# -*- coding: utf-8 -*-
from highlights.conf import settings


def get_block(block):
    for b in settings.HIGHLIGHT_BLOCKS:
        if b[0] == block:
            return b


def get_block_settings(block):
    return get_block(block)[2]


def get_block_template(block):
    block_settings = get_block_settings(block)
    return block_settings['template_name'] # TODO: validar...
