# -*- coding: utf-8 -*-
import datetime
from django.db import models
from django.utils.translation import ugettext_lazy as _
from managers import LiveHighlightManager
from conf import settings
#from highlights import MultiSelectField 
from multiselectfield import MultiSelectField
from django.core.urlresolvers import reverse

from utils.validators import validate_object_size

LINKTARGET_CHOICES = (
    ('', ''),
    ('_self', _('Current window')),
    ('_blank', _('New window')),
)


class Highlight(models.Model):
    BLOCK_CHOICES = [b[:2] for b in settings.HIGHLIGHT_BLOCKS]

    # Fields
    order = models.IntegerField(_('Orden'), blank=True, null=True)
    block = MultiSelectField(_('block'), max_length=1000, choices=BLOCK_CHOICES)
    title = models.TextField(_('title'), max_length=250, blank=True, null=True)
    sub_title = models.TextField(_('sub_title'), max_length=250, blank=True, null=True)
    location = models.CharField(_('location'), max_length=250, blank=True, null=True)
    highlight_body = models.TextField(_('text'), blank=True, null=True)
    link = models.CharField(_('link'), max_length=255, blank=True)
    link_target = models.CharField(_('link target '), choices=LINKTARGET_CHOICES, max_length=15, blank=True, null=True)
    file = models.FileField(_('file'), blank=True,
                            upload_to='highlights/highlight_files/')
    mobile_file = models.FileField(_('mobile file'), blank=True,
                            upload_to='highlights/highlight_mobile_files/')
    extra_file = models.FileField(_('extra file'), blank=True, null=True,
                                  upload_to='highlights/highlight_files/')
    file_caption = models.TextField(_('file caption'), null=True, blank=True)
    video = models.CharField(_('video'), max_length=400, null=True, blank=True, help_text='Utilizar un iframe para mostrar un video')
    is_sticky = models.BooleanField(_('is sticky?'), default=False, db_index=True)
    is_public = models.BooleanField(_('visible'), default=True, db_index=True)
    login_required = models.BooleanField(_('login required?'), default=False, db_index=True)
    pub_date = models.DateTimeField(_('publication date'), default=datetime.datetime.now, db_index=True)
    pub_end_date = models.DateTimeField(_('publication end date'), blank=True, null=True, db_index=True)
    creation_date = models.DateTimeField(_('creation date'), editable=False, default=datetime.datetime.now)

    # Managers
    objects = models.Manager()
    live_objects = LiveHighlightManager()

    class Meta:
        verbose_name = _('highlight')
        verbose_name_plural = _('highlights')
        ordering = ('order',)

    @property
    def is_flash(self):
        return self.file.name.lower().endswith('.swf')

    def __unicode__(self):
        return self.title if self.title else ''

    def get_absolute_url(self):
        return reverse('highlight_edit', args=[str(self.id)])

#  class HighlightMultiBlock(models.Model):
#     BLOCK_CHOICES = [b[:2] for b in settings.HIGHLIGHT_BLOCKS]

#     # Fields
#     block = MultiSelectField(_('block'), max_length=500, choices=BLOCK_CHOICES)
#     title = models.CharField(_('title'), max_length=250)
#     body = models.TextField(_('text'), blank=True)
#     link = models.CharField(_('link'), max_length=100, blank=True)
#     file = models.FileField(_('file'), help_text=_('Image or flash file.'), blank=True,
#                             upload_to='multiblock_highlights/multiblock_highlight_files/')
#     video = models.CharField(_('video'), max_length=400, null=True, blank=True)
#     is_public = models.BooleanField(_('is public?'), default=True, db_index=True)
#     login_required = models.BooleanField(_('login required?'), default=False, db_index=True)
#     pub_date = models.DateTimeField(_('publication date'), default=datetime.datetime.now, db_index=True)
#     pub_end_date = models.DateTimeField(_('publication end date'), blank=True, null=True, db_index=True)
#     creation_date = models.DateTimeField(_('creation date'), editable=False, default=datetime.datetime.now)

#     # Managers
#     # objects = models.Manager()
#     # live_objects = LiveHighlightManager()

#     class Meta:
#         verbose_name = _('multiblock highlight')
#         verbose_name_plural = _('multiblock highlights')
#         ordering = ('-pub_date',)

#     @property
#     def is_flash(self):
#         return self.file.name.lower().endswith('.swf')

#     def __unicode__(self):
#         return self.title


class Banner(models.Model):
    title = models.CharField(_('title'), max_length=20)
    img = models.ImageField(
        _('Imagen'), upload_to='highlights/banners',
        validators=[validate_object_size]
    )
    is_visible = models.BooleanField(_('visible?'), default=True)
    link = models.CharField(_('link'), max_length=255, blank=True)
    link_target = models.CharField(_('link target '), choices=LINKTARGET_CHOICES, max_length=15, blank=True, null=True)
