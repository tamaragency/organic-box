console.log("questionnaire");

jQuery(function($){
  theme.questionnaire = (function(){
    function Questionnaire(){
      var _this = this;
      if($(document).find('.template--page-questionnaire').length > 0){
        this._stepNavigation();
        this._selectSwatch();
        this._closeStepModal();
        this._insertStep(1, '[data-all-steps]');
        setTimeout(function(){ _this._insertQuestion('box-1-1', $('[data-all-steps] .questionnaire-area-step-1')); }, 2000);
        this._resumeQuiz();
        this._jumpToPrevStep();
        this._confirmChoices();
      }
      this._insertPropertyInputs();
    }
    Questionnaire.prototype = $.extend({}, Questionnaire.prototype, {
      _stepNavigation: function(){
        var _this = this;
        $(document).on('click', '.js-answer-option', function(e){
          if($(this).attr('href').indexOf('javascript') > -1) e.preventDefault();
          var triggerString = $(this).data('href');
          var isLast = $(this).hasClass('last-question') ? true : false;
          _this._closeModal();
          var currentStepNum = parseInt($(this).closest('.step-box').data('id').split('-')[1]);
          var triggerStepNum = parseInt(triggerString.split('-')[1]);
          $(this).addClass('active');
          $(this).parent().siblings().find('.js-answer-option').removeClass('active');
          theme.questionnaireData[$(this).closest('.step-box').data('id')].a = $(this).text();
          theme.questionnaireData[$(this).closest('.step-box').data('id')].qaPattern = $(this).closest('.step-box').data('id').replace('box-','')+'-'+($(this).parent().index()+1);
          _this._stepNavProgress(currentStepNum, isLast);
          if(triggerString.indexOf('popup-') > -1){
            var modalSel = triggerString.replace('box-', '');
            $('section[data-modal="'+modalSel+'"]').addClass('cc-popup--visible');
          } else {            
            if(currentStepNum != triggerStepNum){
              _this._insertStep(triggerStepNum, '[data-all-steps]');
              setTimeout(function(){ _this._insertQuestion(triggerString, $('[data-all-steps] .questionnaire-area-step-'+triggerStepNum)); }, 1500);
            } else {
              _this._insertQuestion(triggerString, $(this).closest('[data-step]'));
            }
          }
        });
      },
      _selectSwatch: function(){
        var _this = this;
        var questionnaire_title_handle = '';
        var questionnaire_title_id = '';
        $(document).on('click', '.js-select-swatch', function(){
          questionnaire_title_handle = $(this).attr('title');
          questionnaire_title_id = $(this).closest('.step-box').data('id');
          if(!$(this).closest('.shade-family').hasClass('active')) {
            // $('.color-palette__consultation-overlay.color-palette--inactive').addClass('active');
            _this._showPopupforUnavailableVariant()
          } else {
            _this._showSelectedVariant(this);
          }
        });
        $(document).on('click', '.color-palette__consultation-overlay__end-result-cta', function(){
          // var domaine = "http://127.0.0.1:9292";
          var domaine = "https://organicbox.fr";
          window.history.replaceState({ }, '', domaine +'/pages/quizz/resume');

            theme.questionnaireData[questionnaire_title_id].a = questionnaire_title_handle
            _this._showSummary();
            $('.color-palette__consultation-overlay').removeClass('active');
        })
      },
      _jumpToPrevStep: function(){
        var _this = this;
        $(document).on('click', '.step-navigation--item', function(){
          if($(this).hasClass('active')) return;
          var activeStepIndex = $(this).siblings('.active').index()+1;
          var goToStepIndex = $(this).index()+1;
          if(goToStepIndex >= activeStepIndex) return;
          _this._updateStepNav(goToStepIndex);
          $(this).find('.progress-bar').css({'width': '0%'});
          $(this).nextAll().find('.progress-bar').css({'width': '0%'});
          $('[data-all-steps]').html($('.completed-steps').find('.questionnaire-area-step-'+goToStepIndex).first()[0].outerHTML);
          $('.completed-steps').find('.questionnaire-area-step-'+goToStepIndex).remove();
          $('.completed-steps').find('.questionnaire-area-step-'+goToStepIndex).nextAll().remove();
          $("html, body").animate({ scrollTop: 0 }, 500);
        });
      },
      _closeStepModal: function(){
        var _this = this;
      	$(document).on('click', '.cc-popup-close', function(e){
          e.preventDefault();
          _this._closeModal($(this).closest('.cc-popup'));
        });
      },
      _closeModal: function($modalSel){
        $modalSel = $modalSel || $(document).find('.cc-popup');
        $modalSel.removeClass('cc-popup--visible');
      },
      _insertStep: function(stepNum, insertToSel){
        var stepInfo = $('.steps-template').find('.questionnaire-area-step-'+stepNum+' .step-box--info').first()[0].outerHTML;
        if(stepNum > 1){
          var prevStepNum = stepNum - 1;
          this._trackCompletedSteps(prevStepNum, $(insertToSel), $('.completed-steps'));
        }
        $(insertToSel).html('<div class="questionnaire-area-step-'+stepNum+'" data-step>'+stepInfo+'</div>');
        this._updateStepNav(stepNum);
        $("html, body").animate({ scrollTop: $(insertToSel).find('[data-step]').offset().top - ($('#shopify-section-header').height()+$('.questionnaire-area-header').height()+140)}, 500);
      },
      _insertQuestion: function(triggerStr, $insertToSel){
        var $stepBox = $('.steps-template').find('[data-id="'+triggerStr+'"]').first();
        if($stepBox.hasClass('step-box--palette')){
          var paletteQ1String = $stepBox.find('.color-palette').data('questions').split(',')[0];
          var paletteQ2String = $stepBox.find('.color-palette').data('questions').split(',')[1];
          var combinationString = theme.questionnaireData[paletteQ1String].a.split('.')[1].trim()+'+'+theme.questionnaireData[paletteQ2String].a.split('.')[1].trim();
          console.log(combinationString);
          if(combinationString) this._showActiveShades(combinationString);
        }
        var questionHtml = $stepBox[0].outerHTML;
        if($insertToSel.find('.step-box--info').length > 0){
          $insertToSel.html(questionHtml);
        } else {
          if($insertToSel.find('[data-id="'+triggerStr+'"]').length == 0) $insertToSel.append(questionHtml);
        }
        $("html, body").animate({ scrollTop: $insertToSel.find('[data-id="'+triggerStr+'"]').offset().top - ($('#shopify-section-header').height()+$('.questionnaire-area-header').height()+140)}, 500);
      },
      _updateStepNav: function(currentStep){
        $('.step-navigation').find('li.step-navigation--item:nth-child('+currentStep+')').removeClass('active-prev');
        $('.step-navigation').find('li.step-navigation--item:nth-child('+currentStep+')').addClass('active').siblings().removeClass('active');
        $('.step-navigation').find('li.step-navigation--item:nth-child('+currentStep+')').siblings().not($('.step-navigation').find('li.step-navigation--item:nth-child('+currentStep+')').prev()).removeClass('active-prev');
        $('.step-navigation').find('li.step-navigation--item:nth-child('+currentStep+')').prev().addClass('active-prev');
      },
      _stepNavProgress: function(currentStep, isLast){
        var quesAvl = $('.steps-template').find('.questionnaire-area-step-'+currentStep+' .step-box:not(.step-box--info)').length;
        var answeredQues = $('[data-all-steps]').find('.js-answer-option.active').length;
        var progress = 0;
        if(answeredQues >= quesAvl || isLast){
          progress = 100;
        } else {
          progress = parseFloat(answeredQues/quesAvl)*100;
        }
        $('.step-navigation').find('li.step-navigation--item:nth-child('+currentStep+') .progress-bar').css({'width':progress+'%'});
      },
      _showActiveShades: function(combStr){
        $(document).find('.color-palette .shade-family').each(function(){
          var combinationArray = $(this).data('combinations').toLowerCase().split(',');
          if($.inArray(combStr.toLowerCase(), combinationArray) !== -1){
            $(this).addClass('active');
          } else {
            $(this).removeClass('active');
          }
        });
      },
      _resumeQuiz: function(){
        var _this = this;
        $(document).on('click', '[href="#resume_quiz"]', function(e){
          e.preventDefault();
          var lastActiveQ = $(document).find('.js-answer-option.active').last().closest('.step-box').data('id');
          var dataObj = theme.questionnaireData;
          var nextKey, foundKey = false;
          _this._closeModal($(this).closest('.cc-popup'));
          $.each(dataObj, function(key, value){
            if(foundKey){
              nextKey = key; return false;
            }
            if(key == lastActiveQ){
              foundKey = true;
            }
          });
          var currentStepNum = parseInt(lastActiveQ.split('-')[1]);
          var triggerStepNum = parseInt(nextKey.split('-')[1]);
          if($(document).find('.questionnaire-summary').hasClass('showing')){
            $(document).find('.questionnaire-summary').removeClass('showing');
            $(document).find('.questionnaire-summary').fadeOut();
            $(document).find('#shopify-section-page-questionnaire').fadeIn();
          }
          if(currentStepNum != triggerStepNum){
            _this._insertStep(triggerStepNum, '[data-all-steps]');
            setTimeout(function(){ _this._insertQuestion(nextKey, $('[data-all-steps] .questionnaire-area-step-'+triggerStepNum)); }, 1500);
          } else {
            _this._insertQuestion(nextKey, $(document).find('.js-answer-option.active').last().closest('[data-step]'));
          }
        });
      },
      _trackCompletedSteps: function(stepNum, $fetchFrom, $addTo){
      	if($fetchFrom.find('.questionnaire-area-step-'+stepNum).length > 0 && $addTo.find('.questionnaire-area-step-'+stepNum).length == 0){
          var stepHtml = $fetchFrom.find('.questionnaire-area-step-'+stepNum).first()[0].outerHTML;
          $addTo.append(stepHtml);
        }
      },
      _showSummary: function(){
        var qaTemplate = '';
        $.each(theme.questionnaireData, function(key, qaInfo){
          if(qaInfo.a != null)
        	qaTemplate += '<div class="qa-group"><div class="question"><span>'+theme.questionnaireResults.qLabel+'</span>'+qaInfo.q+'</div><div class="answer"><span>'+theme.questionnaireResults.aLabel+'</span>'+qaInfo.a+'</div></div>';
        });
        $(document).find('.js-insert-qa').html(qaTemplate);
        $(document).find('#shopify-section-page-questionnaire').fadeOut();
        $(document).find('.questionnaire-summary').fadeIn();
        $(document).find('.questionnaire-summary').addClass('showing');
        $("html, body").animate({ scrollTop: 0 }, 500);
      },
      _showPopupforUnavailableVariant: function(){
        $('.color-palette__consultation-overlay.color-palette--inactive').addClass('active');
      },
      _showSelectedVariant: function($el){
        let questionnaire_step_elm = $('.questionnaire_step_number_text')
        let palette_category_elm = $('.selected-color-palette--category')
        let palette_title_elm = $('.selected-color-palette--title');
        let img_cont = $('.color-palette__consultation-overlay__image');
        let img_elm_html = $($el).html();
        let palette_title = $($el).attr('title').trim();
        let palette_category = $($el).closest('.shade-family').attr('data-category').trim();
        let data_step = $($el).closest('.shade-family').attr('data-step');
        (palette_title == '') ? palette_title_elm.hide() : (palette_title_elm.text(palette_title), palette_title_elm.show());
        (palette_category == '') ? palette_category_elm.hide() : (palette_category_elm.text(palette_category), palette_category_elm.show());
        img_cont.html(img_elm_html)
        questionnaire_step_elm.html(`??tape ${data_step}`)

        $('.color-palette__consultation-overlay.color-palette--active').addClass('active');
      },
      _confirmChoices: function(){
        var _this = this;
        $(document).on('click', '[href="#show-results"]', function(e){
          e.preventDefault();
          _this._showOffer();
        });
      },
      _showOffer: function(){
      	var defaultProduct = false, combArr = [], productInfoTemplate = '', offerProduct = false;
        $.each(theme.questionnaireResults.offers, function(i, offer){
          if(offer.qaCombinations.length == 0){
            defaultProduct = offer.product; return false;
          }
        });
        $.each(theme.questionnaireData, function(j, qaInfo){
          if(qaInfo.qaPattern && qaInfo.qaPattern != null) combArr.push(qaInfo.qaPattern);
        });
        if(defaultProduct) offerProduct = defaultProduct;
        $.each(theme.questionnaireResults.offers, function(k, offer){
          if(offer.qaCombinations.length > 0){
            var isOffer = offer.qaCombinations.every(function(val) { return combArr.indexOf(val) >= 0; });
            if(isOffer){
              offerProduct = offer.product; 
              return false;
            }
          }
        });
        console.log(offerProduct);
        if(offerProduct){
          theme.questionnaireData.offerProductHandle = offerProduct.handle;
          window.localStorage.setItem('questionnaire-data', JSON.stringify(theme.questionnaireData));
          productInfoTemplate += '<div class="product-details">';
          if(offerProduct.featured_image != null){
            productInfoTemplate += '<div class="image-wrapper"><img src="'+offerProduct.featured_image+'" /></div>';
          }
          productInfoTemplate += '<h6 class="title">'+offerProduct.title+'</h6>';
          productInfoTemplate += '<p class="price"><span class="theme-money">' + theme.Shopify.formatMoney(offerProduct.price, theme.money_format) + '</span></p>';
          productInfoTemplate += '</div>';
          $(document).find('.js-insert-product-info').html(productInfoTemplate);
          $(document).find('.offer-area .offer-btn').attr('href', '/products/'+offerProduct.handle);
        } else {
          $(document).find('.offer-area .offer-btn').hide();
        }
        $(document).find('.questionnaire-summary').removeClass('showing');
        $(document).find('.questionnaire-summary').fadeOut();
        $(document).find('.questionnaire-results').fadeIn();
        $("html, body").animate({ scrollTop: 0 }, 500);
      },
      _insertPropertyInputs: function(){
        if(window.location.href.indexOf('/products/') < 0 || $(document).find('.js-product-form').length == 0) return;
        var qaInfo = JSON.parse(window.localStorage.getItem('questionnaire-data')), propertiesInputTemplate = '';        
        if(window.location.href.split('/products/')[1].split('?')[0] != qaInfo.offerProductHandle) return;
        $.each(qaInfo, function(key, qaObj){
          if(key.indexOf('box-') >= 0 && qaObj.a != null){
            propertiesInputTemplate += '<input type="hidden" name="properties[_'+qaObj.q+']" value="'+qaObj.a+'" />';
          }
        });
        $(document).find('.js-product-form').prepend(propertiesInputTemplate);
        window.localStorage.removeItem('questionnaire-data');
      }
    });
    return Questionnaire;
  })();

  new theme.questionnaire();
  
});