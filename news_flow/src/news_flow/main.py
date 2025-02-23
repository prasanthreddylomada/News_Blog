#!/usr/bin/env python
from random import randint
from pydantic import BaseModel

from crewai.flow.flow import Flow, listen, start

from news_flow.crews.Summarise_crew.Summarise_crew import SummariseCrew
from src.news_flow.crews.NER_crew.NER_crew import NERCrew


class State(BaseModel):
    paragrpah: str = ""
    NRE_result: str =""
    summary_result: str =""
    information: str = ""


class News_Flow(Flow[State]):

    @start()
    def generate_ner(self):
        print("Generating NER for the given paragraph")
        self.state.paragrpah= "Bangalore, also known as Bengaluru, is the capital of Karnataka, India. It is often referred to as the Silicon Valley of India due to its thriving IT industry. Major tech companies like Infosys, Wipro, and TCS have their headquarters or large offices in the city. The iconic Electronic City and Whitefield house several multinational corporations, including Google, Amazon, and Microsoft.The city is also home to prestigious educational institutions like Indian Institute of Science (IISc) and Indian Institute of Management Bangalore (IIMB). Bangalore’s startup ecosystem is booming, with companies like Flipkart, Swiggy, and Razorpay emerging as unicorns.Apart from technology, Bangalore is known for its pleasant climate and lush green parks such as Lalbagh Botanical Garden and Cubbon Park. Tourists often visit Nandi Hills, located about 60 km from the city, for a weekend getaway. The city’s Kempegowda International Airport is one of the busiest in India, connecting Bangalore to global destinations."
        result = (
            NERCrew()
            .crew()
            .kickoff(inputs={'paragraph': self.state.paragrpah})
        )

        print("NRE generated", result.raw)
        self.state.NRE_result = result.raw

    @listen(generate_ner)
    @start()
    def generate_summary(self):
        print("Generating summary for the given website")
        self.state.information = "SIX PILGRIMS from West Bengal were killed and two others injured as their car collided with a stationary truck on Friday late evening while they were travelling to Prayagraj in Uttar Pradesh to attend the Maha Kumbh Mela, police said on Saturday.The accident took place on the National Highway from Kolkata to Delhi under Rajganj police station limits, around 20 km from Dhanbad district headquarters in Jharkhand, police said. Those killed were two men, two women and two minors, all residents of Kamarpukur village in Hooghly district, police said, adding that efforts are on to ascertain their identities.The injured were taken to Shaheed Nirmal Mahato Medical College Hospital for treatment. Four of the victims died on the spot, said Rajganj Police Station officer-in-charge Alisha Kumari.Chief Minister Mamata Banerjee expressed grief over the incident."
        result = (
            SummariseCrew()
            .crew()
            .kickoff(inputs={'information': self.state.information})
        )

        print("summary generated", result.raw)
        self.state.summary_result = result.raw




def kickoff():
    news_flow = News_Flow()
    news_flow.kickoff()


def plot():
    news_flow = News_Flow()
    news_flow.plot()


if __name__ == "__main__":
    kickoff()
