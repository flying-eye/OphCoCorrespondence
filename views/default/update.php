<?php
	$this->breadcrumbs=array($this->module->id);
	$this->header();
?>

<h3 class="withEventIcon" style="background:transparent url(<?php echo $this->imgPath?>medium.png) center left no-repeat;"><?php echo $this->event_type->name ?></h3>

<div id="event_<?php echo $this->module->name?>">
	<?php
		$form = $this->beginWidget('BaseEventTypeCActiveForm', array(
			'id'=>'clinical-create',
			'enableAjaxValidation'=>false,
			'htmlOptions' => array('class'=>'sliding'),
		));
	?>

		<div class="elements">
			<?php $this->renderDefaultElements($this->action->id, $form); ?>
			<?php $this->renderOptionalElements($this->action->id, $form); ?>
		</div>

		<?php $this->displayErrors($errors)?>

		<div class="cleartall"></div>
		<div class="form_button">
			<img class="loader" style="display: none;" src="/img/ajax-loader.gif" alt="loading..." />&nbsp;
			<button type="submit" class="classy green venti" id="et_save_draft" name="savedraft"><span class="button-span button-span-green">Save draft</span></button>
			<button type="submit" class="classy green venti" id="et_save_print" name="saveprint"><span class="button-span button-span-green">Save and print</span></button>
			<button type="submit" class="classy red venti" id="et_cancel" name="cancel"><span class="button-span button-span-red">Cancel</span></button>
		</div>
	<?php $this->endWidget(); ?>
</div>

<div id="dialog-confirm-cancel" title="Cancel">  <p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>All changes will be lost. Are you sure?</p>
</div>

<?php $this->footer() ?>
