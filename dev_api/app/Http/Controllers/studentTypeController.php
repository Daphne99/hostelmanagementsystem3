<?php
namespace App\Http\Controllers;

use App\Models2\StudentType;

class studentTypeController extends Controller {
	var $data = array();
	var $panelInit ;

	public function __construct(){
		if(app('request')->header('Authorization') != "" || \Input::has('token')){
			$this->middleware('jwt.auth');
		}else{
			$this->middleware('authApplication');
		}

		$this->panelInit = new \DashboardInit();
		$this->data['panelInit'] = $this->panelInit;
		$this->data['users'] = $this->panelInit->getAuthUser();

		if(!isset($this->data['users']->id)){
			return \Redirect::to('/');
		}
	}

	public function listAll($page = 1, $search = ""){
		if(!$this->panelInit->can( array("studentType.list") )){
			exit;
		}

		$toReturn = array();

		if(!is_null(request()->input('sort')) && !empty(request()->input('sort'))) {
			$sort = request()->input('sort');
		} else {
			$sort = 'DESC';
		}

		$toReturn["student_types"] = StudentType::select('id','title','description')
			->orderby('id', $sort)
			->get()->toArray();

		return $toReturn;
	}

	public function create(){
		if(!$this->panelInit->can( array("studentType.add") )){
			exit;
		}

		$student_types = new StudentType;
		if(\Input::has('id')){
			$student_types->id = \Input::get('id');
		}
		$student_types->title = \Input::get('title');
		if(\Input::has('description')){
			$student_types->description = \Input::get('description');
		}
		$student_types->save();

		user_log('Fee Group Types', 'create', $student_types->title);

		return $this->panelInit->apiOutput(true,'Create Fee Group Type','Success add new Fee Group Type');
	}

	public function fetch($id){
		if(!$this->panelInit->can( array("studentType.list") )){
			exit;
		}

		$student_types = StudentType::select('id','title','description')->where('id',$id)->first()->toArray();
		return $student_types;
	}

	public function edit($id){
		if(!$this->panelInit->can( array("studentType.edit") )){
			exit;
		}

		$student_types = StudentType::find($id);
		if(\Input::has('id')){
			$student_types->id = \Input::get('id');
		}
		$student_types->title = \Input::get('title');
		if(\Input::has('description')){
			$student_types->description = \Input::get('description');
		}
		$student_types->save();
		user_log('Fee Group Types', 'edit', $student_types->title);
		return $this->panelInit->apiOutput(true,'Update Fee Group Type','Success update Fee Group Type');
	}

	public function delete($id){
		if(!$this->panelInit->can( array("studentType.del") )){
			exit;
		}

		if ( $postDelete = StudentType::where('id', $id)->first() ){
			user_log('Fee Group Types', 'delete', $postDelete->title);
  		$postDelete->delete();
			return $this->panelInit->apiOutput(true,'Delete Fee Group Type','Success delete Fee Group Type');
  	}else{
  		return $this->panelInit->apiOutput(true,'Delete Fee Group Type','`Fee Group Type` not exists');
  	}
	}

}