define([
  'core/js/adapt',
  'core/js/views/componentView',
  'core/js/models/componentModel'
], function(Adapt, ComponentView, ComponentModel) {

  var SubMenuView = ComponentView.extend({

    events: {
      'click .js-menu-item': 'onNavigate',
      'click .js-menu-item-over': 'onNavigate',
      'mouseover .js-menu-item': 'onHover',
      'mouseout .js-menu-item-over': 'onHoverOut',
      'click .js-menu-mobile-item': 'onNavigate'
    },

    preRender: function() {
      this.checkIfResetOnRevisit();
    },

    postRender: function() {
      this.setReadyStatus();

      this.setupInview();
    },

    setupInview: function() {
      var selector = this.getInviewElementSelector();
      if (!selector) {
        this.setCompletionStatus();
        return;
      }

      this.setupInviewCompletion(selector);

      const itemCount = this.model.get('_items').length;
      let itemsLocked = 0;
      let itemsComplete = 0;

      this.model.get('_items').forEach(function(item, index) {
        const unlockid = item._unlockBy;
        if( Adapt.findById(unlockid).get('_isComplete') === false) {
          $('.submenu__item').eq(index).addClass('is-disabled');
          $('.js-menu-mobile-item').eq(index).addClass('is-disabled');
          itemsLocked++;
        }
        if( Adapt.findById(item._href).get('_isComplete') === true) {
          $('.submenu__item').eq(index).addClass('is-complete');
          $('.js-menu-mobile-item').eq(index).addClass('is-complete');
          itemsComplete++;
        }
      });

      const itemsUnlocked = itemCount - itemsLocked;

      if(itemsUnlocked > 1) {
        this.$('.component__instruction').html(this.model.get('instruction2'));
      }
      if (itemsComplete === itemCount) {
        this.$('.component__instruction').html(this.model.get('instruction3'));
      }
      
    },

    /**
     * determines which element should be used for inview logic - body, instruction or title - and returns the selector for that element
     */
    getInviewElementSelector: function() {
      if (this.model.get('body')) return '.component__body';

      if (this.model.get('instruction')) return '.component__instruction';

      if (this.model.get('displayTitle')) return '.component__title';

      return null;
    },

    checkIfResetOnRevisit: function() {
      var isResetOnRevisit = this.model.get('_isResetOnRevisit');

      // If reset is enabled set defaults
      if (isResetOnRevisit) {
        this.model.reset(isResetOnRevisit);
      }
    },

    onNavigate: function(event) {
      event.preventDefault();

      Backbone.history.navigate('#/id/' + this.$(event.currentTarget).data('href'), {trigger: true});
    },

    onHover: function (event) {
      const index = this.$(event.currentTarget).data('index');

      this.model.get('_items').forEach(function(item, i) {

        if(i === index) {
          if(!this.$('.submenu__item').eq(index).hasClass('is-disabled')){
            this.$('.submenu__item-over').eq(index).addClass('is-visible');
          }
        }

      });
      
    },

    onHoverOut: function (event) {
      const index = this.$(event.currentTarget).data('index');

      this.model.get('_items').forEach(function(item, i) {

        if(i === index) {
          this.$('.submenu__item-over').eq(index).removeClass('is-visible');
        }

      });
    }


  },
  {
    template: 'submenu'
  });

  return Adapt.register('submenu', {
    model: ComponentModel.extend({}),// create a new class in the inheritance chain so it can be extended per component type if necessary later
    view: SubMenuView
  });
});
