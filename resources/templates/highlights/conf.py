# -*- coding: utf-8 -*-
#from miles.conf import appsettings
from milesconfig.settings import AppSettings
from django.utils.translation import ugettext_lazy as _

#class Settings(appsettings.AppSettings):
class Settings(AppSettings):
    # You probably want to override this to define your own blocks
    ## Highlights
    HIGHLIGHT_BLOCKS = (
        ('home-primary', _('Home: Primary highlight'),
         {'template_name': 'highlights/home_primary.html'}),
        ('home-secondary', _('Home: Secondary highlight'),
         {'template_name': 'highlights/home_secondary.html'}),
    )

settings = Settings()
