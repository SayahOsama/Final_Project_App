import { Card, Flex, NativeSelect, TextInput, Title,Text, Fieldset, Group, Button, NumberInput, Grid } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates';
import React, { useEffect, useState } from 'react'
import { ErrorMessage } from '../error/error';
import { Page, isAPIStatusEnum } from '../main/main-page';
import { AuthApi } from '@/api/authApi';

export const AddNewEventPage:React.FC<Page> = ({setCurrentPage}) => {
    const [title, setTitle] = useState<string>('');
    const [category, setCategory] = useState<string>('Charity Event');
    const [description, setDescription] = useState<string>('');
    const [organizer, setOrganizer] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [image, setImage] = useState<string>('');
    const [startValue, setStartValue] = useState<Date | null>(null);
    const [endValue, setEndValue] = useState<Date | null>(null);
    const [validStartDate, setValidStartDate] = useState<boolean>(true);
    const [startDateValidatiorMessage, setStartDateValidatiorMessage] = useState<string>('');
    const [validEndDate, setValidEndDate] = useState<boolean>(true);
    const [endDateValidatiorMessage, setEndDateValidatiorMessage] = useState<string>('');
    const [ticketsNum, setTicketsNum] = useState<string | number>(0);
    const [tickets, setTickets] = useState<any>([]);
    const [price, setPrice] = useState<number | string>('');
    const [quantity, setQuantity] = useState<number | string>('');
    const [name, setName] = useState<string>('');
    const [ticketValidationMessage, setTicketValidationMessage] = useState<string>('');
    const [validTicket, setValidTicket] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');


    useEffect(() => {
        if(!startValue){
            setStartDateValidatiorMessage('');
        }
        if(!endValue){
            setEndDateValidatiorMessage('');
        }
        handleDatesChange();
    }, [startValue,endValue]);

    const validateStartDate = () =>{
        if(startValue && startValue >= (new Date())){
            if(endValue){
                if(startValue > endValue){
                    setStartDateValidatiorMessage('start date has to be earlier than end date');
                    setValidStartDate(false);
                    return;
                }
            }
            setStartDateValidatiorMessage('Valid Start Date');
            setValidStartDate(true);
            return;
        }
    setStartDateValidatiorMessage('start date has to be later than current time');
    setValidStartDate(false);
    }

    const validateEndDate = () =>{
        if(endValue && endValue >= (new Date())){
            if(startValue){
                if(endValue < startValue){
                    setEndDateValidatiorMessage('end date has to be later than start date');
                    setValidEndDate(false);
                    return;
                }
            }
            setEndDateValidatiorMessage('Valid End Date');
            setValidEndDate(true);
            return;
        }
        setEndDateValidatiorMessage('end date has to be later than current time');
        setValidEndDate(false);
    }

    const handleDatesChange = () => {
        if(startValue) validateStartDate();
        if(endValue) validateEndDate();
    }

    const handleAddTicket = () => {
        if(name == '' || price == '' || quantity == ''){
            setValidTicket(false);
            setTicketValidationMessage('Please Fill All Of The Required Ticket Fields');
            return;
        }
        setValidTicket(true);
        setTicketValidationMessage('');
        setTicketsNum(Number(ticketsNum)+Number(quantity));
        setTickets(tickets.concat({name,quantity,price}));
        setName('');
        setPrice('');
        setQuantity('');
    }

    const cards = tickets?.map((ticket:any,index:number) => {
        return(
                <Card style={{flexGrow: '0'}} key={index} shadow="lg" p="md" radius="md" component="a" className="card">
                    <Flex justify="center" align="center" direction="column">
                        <Title order={4} className="title">
                            {ticket.name}
                        </Title>
                        <Text  size="sm" fw={700} mt="sm">
                            Ticket Quantity: {ticket.quantity}
                        </Text>
                        <Text  size="sm" fw={700} mt="sm">
                            Ticket Price: {ticket.price}$
                        </Text>
                    </Flex>
                </Card>
      )});

    const handleAddEvent = async () => {
        if(startValue && endValue && validStartDate && validEndDate && title != '' && description != '' && category != ''&& location != '' && organizer != '' && tickets.length > 0){
            const res = await AuthApi.createEvent(title,category,description,organizer,location,startValue,endValue,tickets,image);
            if(!isAPIStatusEnum(res)){
                setCurrentPage('backOffice');
                return;
            }else{
                setErrorMessage('Failed to create a new event, please try again');
                return;
            }   
        }
        setErrorMessage('please fill all required fields');
    }

    return (
        <>
            {errorMessage && <ErrorMessage message={errorMessage}/>}
            <Flex style={{ alignSelf: "center"}} align="center" justify="center" direction="column">
                    <Flex justify="center" direction="row" columnGap="xl">
                        <Flex justify="flex-start" align="flex-start" direction="column" rowGap="md">
                            <TextInput
                                withAsterisk
                                label="Title:"
                                placeholder="Enter Event Title"
                                onChange={(event) => setTitle(event.currentTarget.value)}
                            /> 
                            <NativeSelect
                                withAsterisk
                                label="Category:"
                                onChange={(event) => setCategory(event.currentTarget.value)}
                                data={['Charity Event', 'Concert', 'Conference', 'Convention', 'Exhibition', 'Festival',
                                    'Product Launch' , 'Sports Event']}
                            />
                            <TextInput
                                withAsterisk
                                label="Location:"
                                placeholder="Enter Event Location"
                                onChange={(event) => setLocation(event.currentTarget.value)}
                            />
                        </Flex>
                        <Flex justify="flex-start" align="flex-start" direction="column" rowGap="md">
                            <TextInput
                                withAsterisk
                                label="Description:"
                                placeholder="Enter Event Description"
                                onChange={(event) => setDescription(event.currentTarget.value)}
                            /> 
                            <TextInput
                                withAsterisk
                                label="Organizer:"
                                placeholder="Enter Event Organizer"
                                onChange={(event) => setOrganizer(event.currentTarget.value)}
                            /> 
                            <TextInput
                                label="Image:"
                                placeholder="Enter Event Image URL"
                                onChange={(event) => setImage(event.currentTarget.value)}
                            />
                        </Flex>
                        <Flex justify="flex-start" align="flex-start" direction="column" rowGap="md">
                            <DateTimePicker
                                withAsterisk
                                clearable
                                style={{width:'fit-content'}}
                                size="sm"
                                valueFormat="DD MMM YYYY hh:mm A"
                                label="Start Date:"
                                placeholder="Pick date and time"
                                dropdownType="modal"
                                onChange={setStartValue}
                                value={startValue}
                            />
                            <span style={{ 
                            fontWeight: 'bold', 
                            color: validStartDate ? 'green' : 'red', 
                            }}>{startDateValidatiorMessage}</span>
                            <DateTimePicker
                                withAsterisk
                                clearable
                                style={{width:'fit-content'}}
                                size="sm"
                                valueFormat="DD MMM YYYY hh:mm A"
                                label="End Date:"
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
                    <Flex justify="center" align="center" direction="column" mt="md" rowGap="md">
                        <Fieldset legend="Ticket Info">
                            <Flex justify="flex-start" align="center" direction="row" columnGap="md">
                                <TextInput withAsterisk value={name} onChange={(event) => setName(event.currentTarget.value)} label="Name" placeholder="Enter Ticket Type" />
                                <NumberInput withAsterisk stepHoldDelay={500} stepHoldInterval={100} allowDecimal={false} allowNegative={false}
                                    value={quantity} onChange={setQuantity} min={0} label="Quantity" placeholder="Enter Ticket Quantity" />
                                <NumberInput withAsterisk stepHoldDelay={500} stepHoldInterval={100} allowDecimal={false} allowNegative={false}
                                    value={price} onChange={setPrice} min={0} label="Price" placeholder="Enter Ticket Price" />
                                <Group justify="flex-end" align='flex-end' mt="xl">
                                    <Button onClick={() => handleAddTicket()} size="compact-sm">Add Ticket</Button>
                                </Group>
                            </Flex>
                            <span style={{ 
                                fontWeight: 'bold', 
                                color: validTicket ? 'green' : 'red', 
                            }}>{ticketValidationMessage}</span>
                        </Fieldset>
                        <Title order={3}> Categories</Title>
                        <Flex style={{maxWidth: '85%'}}  align="flex-start" justify="center" direction="row" columnGap="xl" wrap="wrap" rowGap="xl">
                            {cards}
                        </Flex>
                        <Text size="sm" fw={700} mt="xs">Total Tickets: {ticketsNum}</Text>
                        <Button onClick={() => handleAddEvent()} size="compact-sm">Add Event</Button>
                    </Flex>
            </Flex>
        </>
  )
}
