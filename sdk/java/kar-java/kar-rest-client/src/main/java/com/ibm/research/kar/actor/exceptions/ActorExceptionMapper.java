package com.ibm.research.kar.actor.exceptions;

import java.util.logging.Logger;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.Provider;

import org.eclipse.microprofile.rest.client.ext.ResponseExceptionMapper;

@Provider
public class ActorExceptionMapper implements ResponseExceptionMapper<ActorException>{

	private static Logger logger = Logger.getLogger(ActorExceptionMapper.class.getName());

	@Override
	public ActorException toThrowable(Response response) {
        switch(response.getStatus()) {
        case 404: return new ActorMethodNotFoundException();
        case 503: return new ActorTypeNotFoundException();
        }
        return null;
	}

}
