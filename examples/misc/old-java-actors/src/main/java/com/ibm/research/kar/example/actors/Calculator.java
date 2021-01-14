/*
 * Copyright IBM Corporation 2020,2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.ibm.research.kar.example.actors;

import static com.ibm.research.kar.Kar.*;

import javax.json.Json;
import javax.json.JsonNumber;
import javax.json.JsonValue;

import com.ibm.research.kar.actor.ActorSkeleton;
import com.ibm.research.kar.actor.annotations.Activate;
import com.ibm.research.kar.actor.annotations.Actor;
import com.ibm.research.kar.actor.annotations.Deactivate;
import com.ibm.research.kar.actor.annotations.Remote;

/**
 * This actor implements a simple calculator that performs operations on an accumulator.
 */
@Actor
public class Calculator extends ActorSkeleton {

	private int accum;

	@Activate
	public void initState() {
		JsonValue v = actorGetState(this, "accum");
		if (v instanceof JsonNumber) {
			accum = ((JsonNumber)v).intValue();
		} else {
			accum = 0;
		}
	}

	@Deactivate
	public void saveState() {
		actorSetState(this, "accum", Json.createValue(accum));
	}

	@Remote
	public void clear() {
		accum = 0;
	}

	@Remote
	public JsonNumber accum() {
		return Json.createValue(accum);
	}

	@Remote
	public JsonNumber add(JsonNumber... nums) {
		for (JsonNumber n : nums) {
			int number = n.intValue();
			accum += number;
		}
		return Json.createValue(this.accum);
	}

	@Remote
	public JsonNumber subtract(JsonNumber... nums) {
		for (JsonNumber n : nums) {
			int number = n.intValue();
			accum -= number;
		}
		return Json.createValue(accum);
	}

	@Remote
	public JsonNumber multiply(JsonNumber num) {
		int number = num.intValue();
		accum *= number;
		return Json.createValue(accum);
	}

	@Remote
	public JsonNumber divide(JsonNumber num) {
		int number = num.intValue();
		accum /= number;
		return Json.createValue(accum);
	}
}
