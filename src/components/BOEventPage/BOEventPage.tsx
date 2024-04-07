import React, { useEffect, useState, useRef} from 'react';
import { AuthApi } from '../../api/authApi';
import { Loader } from '../loader/loader';
import { Card, Image, Text, Badge, Flex, Title, Button} from '@mantine/core';
import { ErrorMessage } from '../error/error';
import { format, formatDate } from 'date-fns';
import { Page, isAPIStatusEnum } from '../main/main-page';
import { DateTimePicker } from '@mantine/dates';

export const BOEventPage:React.FC<Page> = ({eventDetails,permission,setCurrentPage}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [event, setEvent] = useState<any>(eventDetails);
  const [commentsNum, setCommentsNum] = useState<number>(0);
  const [validStartDate, setValidStartDate] = useState<boolean>(true);
  const [startDateValidatiorMessage, setStartDateValidatiorMessage] = useState<string>('');
  const [validEndDate, setValidEndDate] = useState<boolean>(true);
  const [endDateValidatiorMessage, setEndDateValidatiorMessage] = useState<string>('');
  const [disableStartDateButton,setDisableStartDateButton] = useState<boolean>(true);  
  const [disableEndDateButton,setDisableEndDateButton] = useState<boolean>(true);   
  const [startValue, setStartValue] = useState<Date | null>(new Date(eventDetails.start_date));
  const [endValue, setEndValue] = useState<Date | null>(new Date(eventDetails.end_date));

  const getEvent = async () => {
    const res = await AuthApi.getEvent(eventDetails._id);
    if(!isAPIStatusEnum(res)){
      setEvent(res.data);
      return;
    }else{
        setIsLoading(false);
        setErrorMessage('Failed to get the event, please try again');
    }
  }

  const getCommentsNum = async () => {
    const res = await AuthApi.getCommentsAmount(eventDetails._id);
    if(!isAPIStatusEnum(res)){
      setCommentsNum(res.data.commentsCount);
      return;
    }else{
        setIsLoading(false);
        setErrorMessage('Failed to get the number of comments, please try again');
    }
  }

  useEffect(() => {
    setIsLoading(true);
    getEvent().then(() => {
        getCommentsNum().then(() => setIsLoading(false));
    });
  }, []);


  const TicketsCards = () => {
     return event.tickets.map((ticket: any,index: number) =>{
      return(
        <Card key={index} shadow="lg" p="md" radius="md" component="a">
          <Flex justify="center" align="center" direction="column">
            <Title order={4} className="title" mt={5}>
              {ticket.name} Tickets
            </Title>
            <Text size="sm" fw={700} mt="md">
              Price: {ticket.price}$
            </Text>
            <Text size="sm" fw={700} mt="md">
              {ticket.quantity}/{ticket.initial_quantity} Tickets
            </Text>
          </Flex>
        </Card>
      );
    })
  }

  const validateStartDate = () =>{
        const startDateObject = new Date(eventDetails.start_date);
        const end_DateObject = new Date(eventDetails.end_date);
        if(startValue && startValue >= startDateObject){
            if(endValue){
                if(startValue > endValue){
                    setStartDateValidatiorMessage('start date has to be earlier than end date');
                    setValidStartDate(false);
                    setDisableStartDateButton(true);
                    return;
                }
            }else{
                if(startValue > end_DateObject){
                    setStartDateValidatiorMessage('start date has to be earlier than end date');
                    setValidStartDate(false);
                    setDisableStartDateButton(true);
                    return;
                }
            }
            setStartDateValidatiorMessage('Valid Start Date');
            setValidStartDate(true);
            setDisableStartDateButton(false);
            return;
        }
    setStartDateValidatiorMessage('you can only postpone start date');
    setValidStartDate(false);
    setDisableStartDateButton(true);
  }

  const validateEndDate = () =>{
    const end_DateObject = new Date(eventDetails.end_date);
    if(endValue && endValue >= end_DateObject){
        if(startValue){
            if(endValue < startValue){
                setEndDateValidatiorMessage('end date has to be later than start date');
                setValidEndDate(false);
                setDisableEndDateButton(true);
                return;
            }
        }
        setEndDateValidatiorMessage('Valid End Date');
        setValidEndDate(true);
        setDisableEndDateButton(false);
        return;
    }
    setEndDateValidatiorMessage('you can only postpone end date');
    setValidEndDate(false);
    setDisableEndDateButton(true);
  }

  useEffect(() => {
    handleDatesChange();
  }, [startValue,endValue]);

  const handleDatesChange = () => {
    validateStartDate();
    validateEndDate();
  }

  const handleDateUpdate = async () => {
    if(validEndDate && validStartDate){
        if(startValue && endValue){ 
            const res = await AuthApi.updateEventDate(eventDetails._id,startValue,endValue);
            if(!isAPIStatusEnum(res)){
                setCurrentPage('backOffice');
            }else{
                setIsLoading(false);
                setErrorMessage('Failed to get the event, please try again');
            }
        }
    }
  }

  return (
    <div>
      {isLoading 
      ? <Loader /> 
      :     <>
            {errorMessage && <ErrorMessage message={errorMessage}/>}
            <Flex justify="center" align="center" direction="column">
              <Card style={{width: '75%'}} shadow="lg" p="md" radius="md" component="a">
                  <Flex justify="flex-start" direction="row" columnGap="xl">
                    <Flex justify="flex-start" direction="column">
                      <Title order={3} className="title" mt={5}>
                        {event.title}
                      </Title>
                      <Image style={{minWidth:'250px', minHeight:'200px',maxWidth:'350px', maxHeight:'300px'}} src={event.image} />
                    </Flex>
                    <Flex style={{marginTop: '15px'}} justify="flex-start" direction="column">
                        <Text size="md" fw={700} mt="md">
                        Event Starts At: {format(new Date(event.start_date), 'MMMM dd, yyyy, h:mm a')}
                        </Text>
                        <Text size="md" fw={700} mt="md">
                          Event ends At: {format(new Date(event.end_date), 'MMMM dd, yyyy, h:mm a')}
                        </Text>
                        <Text size="sm" fw={700} mt="md">
                          Event By: {event.organizer}
                        </Text>
						            <Text size="sm" fw={700} mt="md">
                          Event Location: {event.location}
                        </Text>
                        <Text lineClamp={3} size="xs" fw={700} mt="md">
                          Description: {event.description}
                        </Text>
                        <Text size="md" fw={700} mt="md">
                          Comments: {commentsNum}
                        </Text>
                      </Flex>
                  </Flex>
                  <Badge className="rating" variant="gradient" gradient={{ from: 'blue', to: 'green' }}>
                      {event.category}
                  </Badge>
                  {(permission=='M' || permission=='A') && (new Date(eventDetails.start_date) > new Date()) ? <><Flex style={{marginTop: '5px'}} justify="flex-start" direction="row" columnGap='xl'>
                        <Flex justify="flex-start" direction="column">
                            <DateTimePicker
                                clearable
                                style={{width:'fit-content'}}
                                size="sm"
                                valueFormat="DD MMM YYYY hh:mm A"
                                label="Update Start Date:"
                                placeholder="Pick date and time"
                                dropdownType="modal"
                                onChange={setStartValue}
                                value={startValue}
                            />
                            <span style={{ 
                            fontWeight: 'bold', 
                            color: validStartDate ? 'green' : 'red', 
                            }}>{startDateValidatiorMessage}</span>
                        </Flex>
                        <Flex justify="flex-start" direction="column">
                            <DateTimePicker
                                clearable
                                style={{width:'fit-content'}}
                                size="sm"
                                valueFormat="DD MMM YYYY hh:mm A"
                                label="Update End Date:"
                                placeholder="Pick date and time"
                                dropdownType="modal"
                                onChange={setEndValue}
                                value={endValue}
                            />
                            <span style={{ 
                            fontWeight: 'bold', 
                            color: validEndDate ? 'green' : 'red', 
                            }}>{endDateValidatiorMessage}</span>
                        </Flex>
                    </Flex> 
                    <Button onClick={() => handleDateUpdate()} disabled={disableEndDateButton || disableStartDateButton}  style={{width:'fit-content'}} size="compact-sm">
                        confirm
                    </Button></>: null}
                  <Flex justify="flex-start" direction="row" >
                    <Text size="lg" fw={700} mt="md">
                      Categories:
                    </Text>
                  </Flex>
                  <Flex justify="space-around" direction="row" wrap="wrap" rowGap='lg' >
                      {TicketsCards()}
                  </Flex>
              </Card>
            </Flex>
            </>}
    </div>
  );
}
